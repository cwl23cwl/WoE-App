"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

const Excalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then((m) => m.Excalidraw),
  { ssr: false }
);

interface StaticExcalidrawProps {
  className?: string;
  width?: number;
  height?: number;
  initialElements?: any[];
  showBackground?: boolean;
}

export default function StaticExcalidraw({
  className = "",
  width = 960,
  height = 540,
  initialElements = [],
  showBackground = true
}: StaticExcalidrawProps = {}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  // 1) Clamp devicePixelRatio while Excalidraw is present
  useLayoutEffect(() => {
    // Some environments/extensions can report absurd DPR values, which explode canvas size.
    const originalDPR = Object.getOwnPropertyDescriptor(window, "devicePixelRatio");
    try {
      Object.defineProperty(window, "devicePixelRatio", {
        configurable: true,
        get: () => 1, // hard-cap DPR to 1 while mounted
      });
    } catch {}
    setMounted(true);
    return () => {
      // restore DPR
      try {
        if (originalDPR) {
          Object.defineProperty(window, "devicePixelRatio", originalDPR);
        } else {
          // fallback restore
          // @ts-ignore
          delete window.devicePixelRatio;
        }
      } catch {}
    };
  }, []);

  // 2) Prevent wheel-zoom and key-zoom; let page scroll
  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      const block = ["+", "=", "-", "0", " "];
      if (e.ctrlKey || e.metaKey || block.includes(e.key.toLowerCase())) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("keydown", onKeyDown, true);
    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("keydown", onKeyDown, true);
    };
  }, []);

  // 3) Fixed, safe container — isolated from outside transforms
  return (
    <div
      ref={wrapperRef}
      className={`excalidraw-safe ${className}`}
      style={{
        width,
        height,
        margin: "0 auto",
        overflow: "hidden",
        border: showBackground ? "1px solid #e5e7eb" : "none",
        borderRadius: showBackground ? 8 : 0,
        backgroundColor: showBackground ? "#ffffff" : "transparent",
        // isolate from extensions / parent transforms:
        transform: "none",
        contain: "layout paint size style",
        position: "relative",
      }}
      tabIndex={0}
    >
      {mounted ? (
        <Excalidraw
          viewModeEnabled={true}
          initialData={{
            appState: {
              viewBackgroundColor: showBackground ? "#ffffff" : "transparent",
              zoom: { value: 1 },
              scrollX: 0,
              scrollY: 0,
              gridSize: null,
            },
            elements: initialElements,
          }}
          UIOptions={{
            canvasActions: {
              changeViewBackgroundColor: false,
              toggleTheme: false,
              zoomIn: false,
              zoomOut: false,
              resetZoom: false,
              clearCanvas: false,
              saveScene: false,
              loadScene: false,
              export: false,
            },
          }}
          scrollToContent={false as any}
        />
      ) : (
        <div 
          className="flex items-center justify-center text-gray-500"
          style={{ width, height }}
        >
          Loading canvas...
        </div>
      )}
    </div>
  );
}
