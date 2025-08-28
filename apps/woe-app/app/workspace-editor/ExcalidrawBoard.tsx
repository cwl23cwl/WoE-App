"use client";

import "@woe/excalidraw-wrapper/index.css";
import dynamic from "next/dynamic";
import { useRef, useCallback } from "react";
import type { ExcalidrawImperativeAPI } from "@woe/excalidraw-wrapper";

// ⬇️ Pick the *named* export, not the module
const RawExcalidraw = dynamic(
  () => import("@woe/excalidraw-wrapper").then(m => m.Excalidraw),
  { ssr: false, loading: () => <div className="p-4">Loading canvas…</div> }
);

export default function ExcalidrawBoard() {
  const apiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const captureApi = useCallback((api: ExcalidrawImperativeAPI) => {
    apiRef.current = api;
  }, []);

  return (
    <div className="w-full h-full">
      <RawExcalidraw excalidrawAPI={captureApi} onReady={captureApi} />
    </div>
  );
}
