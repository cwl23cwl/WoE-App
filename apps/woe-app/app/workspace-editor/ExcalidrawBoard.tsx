"use client";

import "@excalidraw/excalidraw/index.css";
import dynamic from "next/dynamic";
import { useRef, useCallback, useEffect } from "react";
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw";
import { setDebugOptions } from "@excalidraw/excalidraw";

// ⬇️ Pick the *named* export, not the module
const RawExcalidraw = dynamic(
  () => import("@excalidraw/excalidraw").then(m => m.Excalidraw),
  { ssr: false, loading: () => <div className="p-4">Loading canvas…</div> }
);

export default function ExcalidrawBoard() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const captureApi = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  // Configure debug options for Excalidraw
  useEffect(() => {
    setDebugOptions({
      textContainerBBox: process.env.NODE_ENV === "development",
      enableTracking: false, // Disable analytics by default
      isDev: process.env.NODE_ENV === "development",
      isProd: process.env.NODE_ENV === "production",
      libraryUrl: process.env.NEXT_PUBLIC_EXCALIDRAW_LIBRARY_URL || "",
      libraryBackendUrl: process.env.NEXT_PUBLIC_EXCALIDRAW_LIBRARY_BACKEND || "",
    });
  }, []);

  return (
    <div className="w-full h-full">
      <RawExcalidraw excalidrawAPI={captureApi} onReady={captureApi} />
    </div>
  );
}
