"use client";

import React, { PropsWithChildren, useEffect, useRef, useState } from "react";

type CanvasZoomLayerProps = PropsWithChildren<{
  /** Logical canvas size; used only for overlay layout / info */
  width: number;
  height: number;
  /** Zoom limits */
  min?: number;
  max?: number;
  step?: number; // for +/- buttons
  /** Start zoom (1 = 100%) */
  initial?: number;
}>;

/**
 * Canvas-only zoom (center-anchored), no pan.
 * - Prevents browser page-zoom on Ctrl/Cmd + wheel or pinch when the canvas is focused
 * - Keeps headers/sidebars at 1×
 * - Works well inside StageFrame (which already auto-fits the page)
 */
export default function CanvasZoomLayer({
  width,
  height,
  min = 0.5,
  max = 3,
  step = 0.1,
  initial = 1,
  children,
}: CanvasZoomLayerProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [zoom, setZoom] = useState(initial);

  // Wheel handler: use ctrlKey to detect pinch/zoom gesture on most browsers
  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only intercept if ctrl/cmd is held (pinch/zoom gesture) or trackpads reporting ctrlKey
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault(); // stop page zoom
        const delta = e.deltaY; // positive: zoom out, negative: zoom in
        const next =
          delta < 0 ? Math.min(max, round2(zoom + step)) : Math.max(min, round2(zoom - step));
        setZoom(next);
      }
      // Otherwise ignore (no scroll inside canvas; StageFrame is overflow hidden)
    };

    // Safari pinch events (iOS/iPadOS). Not all environments fire these, but harmless if they don't.
    const onGestureStart = (e: Event) => {
      e.preventDefault();
    };
    const onGestureChange = (e: any) => {
      e.preventDefault();
      // e.scale is relative to gesture start; nudge toward it without panning
      // Simple approach: step by small increments when e.scale deviates from 1
      const SCALE_STEP = step;
      let next = zoom;
      if (e.scale > 1.02) next = Math.min(max, round2(zoom + SCALE_STEP));
      else if (e.scale < 0.98) next = Math.max(min, round2(zoom - SCALE_STEP));
      setZoom(next);
    };
    const onGestureEnd = (e: Event) => {
      e.preventDefault();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("gesturestart", onGestureStart as any, { passive: false });
    el.addEventListener("gesturechange", onGestureChange as any, { passive: false });
    el.addEventListener("gestureend", onGestureEnd as any, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel as any);
      el.removeEventListener("gesturestart", onGestureStart as any);
      el.removeEventListener("gesturechange", onGestureChange as any);
      el.removeEventListener("gestureend", onGestureEnd as any);
    };
  }, [zoom, min, max, step]);

  return (
    <div ref={hostRef} className="w-full h-full relative select-none">
      {/* Centered canvas; zoom applies here only */}
      <div
        className="absolute inset-0 grid place-items-center overflow-hidden"
        // overflow hidden so there is no pan; zoom is center-anchored
      >
        <div
          className="relative"
          style={{
            width,
            height,
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          {children}
        </div>
      </div>

      {/* Small zoom HUD (optional) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border bg-background/80 backdrop-blur px-2 py-1">
        <button
          type="button"
          className="px-2 py-1 text-sm rounded-md hover:bg-muted"
          onClick={() => setZoom((z) => Math.max(min, round2(z - step)))}
          aria-label="Zoom out"
          title="Zoom out"
        >
          −
        </button>
        <div className="min-w-16 text-center text-xs tabular-nums">{Math.round(zoom * 100)}%</div>
        <button
          type="button"
          className="px-2 py-1 text-sm rounded-md hover:bg-muted"
          onClick={() => setZoom((z) => Math.min(max, round2(z + step)))}
          aria-label="Zoom in"
          title="Zoom in"
        >
          +
        </button>
        <button
          type="button"
          className="ml-1 px-2 py-1 text-xs rounded-md hover:bg-muted"
          onClick={() => setZoom(1)}
          aria-label="Reset zoom"
          title="Reset"
        >
          Reset
        </button>
      </div>
    </div>
  );
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
