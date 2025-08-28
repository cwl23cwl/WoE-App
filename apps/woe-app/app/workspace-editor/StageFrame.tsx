"use client";

import React, { useEffect, useRef, useState, PropsWithChildren } from "react";

type StageFrameProps = PropsWithChildren<{
  /** Logical stage size in pixels (kept for coordinates; visually scaled). */
  width?: number;
  height?: number;
  /** Optional header height (px) reserved at top of page layout. */
  headerHeightPx?: number;
}>;

const DEFAULT_W = 1200;
const DEFAULT_H = 800;

/**
 * Centers a fixed-size "page stage" and scales it to fit the available space.
 * - No inner scrolling; outer page can scroll if needed.
 * - Keeps a stable coordinate system (width x height) for your canvas.
 * - Browser/page zoom still works.
 */
export default function StageFrame({
  width = DEFAULT_W,
  height = DEFAULT_H,
  headerHeightPx = 64,
  children,
}: StageFrameProps) {
  const outerRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const el = outerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(([entry]) => {
      const { width: W, height: H } = entry.contentRect;
      // leave a little breathing room
      const fitW = Math.max(0, W - 16);
      const fitH = Math.max(0, H - 16);
      const s = Math.min(fitW / width, fitH / height);
      setScale(Number.isFinite(s) && s > 0 ? s : 1);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [width, height]);

  return (
    <div
      ref={outerRef}
      className="relative w-full"
      style={{
        // Fill viewport minus header space; page (not stage) can scroll if content below exists.
        minHeight: `calc(100vh - ${headerHeightPx}px)`,
      }}
    >
      {/* Center the stage */}
      <div className="w-full h-full grid place-items-center">
        {/* Fixed logical size; visually scaled. No inner scrolling. */}
        <div
          className="relative bg-white rounded-2xl shadow-xl overflow-hidden"
          style={{
            width,
            height,
            transform: `scale(${scale})`,
            transformOrigin: "top center",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
