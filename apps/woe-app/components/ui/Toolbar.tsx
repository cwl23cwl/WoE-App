// components/ui/Toolbar.tsx
"use client";

import { MousePointer, Pencil, Type, Eraser, Highlighter, ZoomIn, ZoomOut, RotateCcw, RotateCw, Trash2, ChevronLeft, ChevronRight } from "lucide-react";

export function Toolbar() {
  return (
    <nav className="toolbar flex flex-wrap items-center gap-3 px-4 py-2 mb-4 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-sm">
      <div className="flex gap-2">
        <button className="btn flex flex-col items-center px-3 py-2 text-xs active" title="Select">
          <MousePointer className="icon" />
          <span>Select</span>
        </button>
        <button className="btn flex flex-col items-center px-3 py-2 text-xs" title="Pencil">
          <Pencil className="icon" />
          <span>Pencil</span>
        </button>
        <button className="btn flex flex-col items-center px-3 py-2 text-xs" title="Text">
          <Type className="icon" />
          <span>Text</span>
        </button>
        <button className="btn flex flex-col items-center px-3 py-2 text-xs" title="Eraser">
          <Eraser className="icon" />
          <span>Eraser</span>
        </button>
        <button className="btn flex flex-col items-center px-3 py-2 text-xs" title="Highlighter">
          <Highlighter className="icon" />
          <span>Highlighter</span>
        </button>
      </div>

      <div className="w-px h-8 bg-[var(--border)] mx-2" />

      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm">
          <span className="w-6 h-6 rounded bg-black border border-[var(--border)]" />
          Pen
        </label>
        <label className="flex items-center gap-2 text-sm">
          Width:
          <input type="range" min={1} max={10} defaultValue={2} className="w-24 accent-[var(--primary)]" />
        </label>
      </div>

      <div className="w-px h-8 bg-[var(--border)] mx-2" />

      <div className="flex items-center gap-2">
        <button className="btn" title="Undo"><RotateCcw className="icon" /></button>
        <button className="btn" title="Redo"><RotateCw className="icon" /></button>

        <button className="btn" title="Zoom Out"><ZoomOut className="icon" /></button>
        <span className="text-sm font-medium">100%</span>
        <button className="btn" title="Zoom In"><ZoomIn className="icon" /></button>

        <span className="text-sm font-medium">1 / 1</span>
        <button className="btn" title="Prev Page"><ChevronLeft className="icon" /></button>
        <button className="btn" title="Next Page"><ChevronRight className="icon" /></button>

        <button className="btn btn-ghost" title="Clear">
          <Trash2 className="icon" />
          <span className="ml-1 hidden sm:inline">Clear</span>
        </button>
      </div>
    </nav>
  );
}
