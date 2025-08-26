"use client";

import React, { useMemo, useRef, useState } from "react";
import StageFrame from "./StageFrame";
import CanvasZoomLayer from "./CanvasZoomLayer";
import ExcalidrawBoard, { ExcalidrawBoardHandle } from "./ExcalidrawBoard";
import CanvasToolbar from "./CanvasToolbar";

/** Presets */
const PRESETS = {
  square:      { label: "Square 1200×1200", width: 1200, height: 1200 },
  brainstorm:  { label: "Brainstorm 1600×900", width: 1600, height: 900 },
} as const;
type PresetKey = keyof typeof PRESETS;

type Page = { id: string; title: string; preset: PresetKey };

// Keep these together so the stage can subtract them from viewport height.
const HEADER_HEIGHT = 64;  // matches your header h-16
const TOOLBAR_HEIGHT = 56; // h-14 below

export default function WorkspaceEditorPage() {
  const [pages, setPages] = useState<Page[]>([
    { id: "p1", title: "Page 1", preset: "square" },
    { id: "p2", title: "Page 2", preset: "square" },
  ]);
  const [currentId, setCurrentId] = useState<string>(pages[0].id);
  const currentPage = useMemo(() => pages.find(p => p.id === currentId)!, [pages, currentId]);
  const dims = PRESETS[currentPage.preset];

  function setPresetForCurrent(next: PresetKey) {
    setPages(prev => prev.map(p => (p.id === currentId ? { ...p, preset: next } : p)));
  }

  // Excalidraw API handle for toolbar actions
  const excaliHandle = useRef<ExcalidrawBoardHandle | null>(null);

  async function handleUploadImage(file: File) {
    const dataURL = await fileToDataURL(file);
    await excaliHandle.current?.addImageFromDataURL(dataURL);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Page header */}
      <header className="h-16 flex items-center justify-between px-4 border-b bg-background/60 backdrop-blur">
        <div className="font-semibold">Workspace Editor</div>
        <PagePresetSegmented value={currentPage.preset} onChange={setPresetForCurrent} />
      </header>

      <main className="flex flex-1 min-h-0">
        {/* Left: page list */}
        <aside className="w-56 shrink-0 border-r p-3 space-y-2 overflow-y-auto">
          <div className="text-sm font-medium mb-2">Pages</div>
          <ul className="space-y-1 text-sm">
            {pages.map((p) => {
              const d = PRESETS[p.preset];
              return (
                <li
                  key={p.id}
                  className={`rounded-md px-2 py-1 cursor-pointer ${
                    currentId === p.id ? "bg-muted font-medium" : "hover:bg-muted"
                  }`}
                  onClick={() => setCurrentId(p.id)}
                >
                  {p.title}
                  <div className="text-xs text-muted-foreground">
                    {d.width}×{d.height}
                  </div>
                </li>
              );
            })}
          </ul>
        </aside>

        {/* Center column: Toolbar strip + Stage below */}
        <section className="flex-1 min-w-0 flex flex-col">
          {/* Dedicated toolbar strip */}
          <div className="h-14 border-b bg-background/80 backdrop-blur flex items-center justify-center px-3">
            <CanvasToolbar
              onTool={(t) => excaliHandle.current?.setActiveTool(t)}
              onUndo={() => excaliHandle.current?.undo()}
              onRedo={() => excaliHandle.current?.redo()}
              onUploadImage={handleUploadImage}
            />
          </div>

          {/* Stage below the toolbar; headerHeightPx subtracts BOTH rows */}
          <div className="flex-1 min-h-0">
            <StageFrame
              width={dims.width}
              height={dims.height}
              headerHeightPx={HEADER_HEIGHT + TOOLBAR_HEIGHT}
            >
              <CanvasZoomLayer width={dims.width} height={dims.height} min={0.5} max={3} step={0.1}>
                <ExcalidrawBoard
                  ref={(h) => { excaliHandle.current = h; }}
                  width={dims.width}
                  height={dims.height}
                />
              </CanvasZoomLayer>
            </StageFrame>
          </div>
        </section>

        {/* Right: inspector (optional) */}
        <aside className="w-64 shrink-0 border-l p-3 space-y-3 overflow-y-auto hidden xl:block">
          <div className="text-sm font-medium">Inspector</div>
          <div className="text-sm text-muted-foreground">
            Per‑page properties will go here later.
          </div>
        </aside>
      </main>
    </div>
  );
}

function PagePresetSegmented({
  value,
  onChange,
}: {
  value: PresetKey;
  onChange: (k: PresetKey) => void;
}) {
  const opts: { key: PresetKey; label: string }[] = [
    { key: "square",     label: PRESETS.square.label },
    { key: "brainstorm", label: PRESETS.brainstorm.label },
  ];
  return (
    <div className="inline-flex rounded-lg border p-1 bg-background">
      {opts.map((o) => (
        <button
          key={o.key}
          type="button"
          onClick={() => onChange(o.key)}
          className={`px-3 py-1 text-sm rounded-md transition
            ${value === o.key ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function fileToDataURL(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = () => res(String(reader.result));
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
}
