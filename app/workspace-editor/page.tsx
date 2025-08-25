// app/workspace-editor/page.tsx
"use client";
import React, { useRef, useState } from "react";
import WoeToolbar from "@/components/WoeToolbar";
import { WoeToolManager } from "@/lib/woe-tool-manager";

// If you have an Excalidraw fork, import it here.
// Example: import { Excalidraw } from "@woe/excalidraw";
// For now we'll stub a <div> representing the canvas.

const toolManager = new WoeToolManager();

export default function WorkspaceEditorPage() {
  const [zoom, setZoom] = useState(1);
  const [saveState, setSaveState] = useState<"saved" | "saving" | "dirty">("saved");
  const [pageIndex, setPageIndex] = useState(1);
  const totalPages = 3;

  const excalidrawRef = useRef<any>(null);

  return (
    <div className="flex h-screen flex-col bg-neutral-950 text-white">
      <WoeToolbar
        toolManager={toolManager}
        onUndo={() => excalidrawRef.current?.history?.undo?.()}
        onRedo={() => excalidrawRef.current?.history?.redo?.()}
        onZoomIn={() => setZoom((z) => Math.min(3, +(z + 0.1).toFixed(2)))}
        onZoomOut={() => setZoom((z) => Math.max(0.25, +(z - 0.1).toFixed(2)))}
        zoom={zoom}
        page={{ index: pageIndex, total: totalPages }}
        saveState={saveState}
      />

      {/* Workspace area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar (page list) */}
        <div className="w-40 border-r border-neutral-800 bg-neutral-900 p-2 text-sm">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className={`mb-2 cursor-pointer rounded p-2 text-center ${
                pageIndex === i ? "bg-white/10" : "hover:bg-white/5"
              }`}
              onClick={() => setPageIndex(i)}
            >
              Page {i}
            </div>
          ))}
        </div>

        {/* Canvas container */}
        <div className="flex-1 bg-neutral-950">
          {/* Replace this div with your <Excalidraw ref={excalidrawRef} /> */}
          <div className="flex h-full items-center justify-center text-neutral-500">
            Canvas area (hook in Excalidraw here)
          </div>
        </div>
      </div>
    </div>
  );
}