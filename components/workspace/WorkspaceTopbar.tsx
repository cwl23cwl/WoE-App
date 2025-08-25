"use client";

import React from "react";
import { MousePointer2, Type as TypeIcon, Square, Circle, Eraser, Save } from "lucide-react";
import clsx from "clsx";

/** Simple top bar:
 *  - Centered tool group (Select, Text, Rect, Ellipse, Eraser)
 *  - Right cluster keeps Zoom, Page, and Saved in the SAME box (your preference)
 */
export default function TopBar() {
  const [zoom, setZoom] = React.useState(100);
  const [page, setPage] = React.useState({ index: 1, total: 5 });
  const [saved, setSaved] = React.useState(true);

  // fake save indicator toggle to show it working
  React.useEffect(() => {
    const t = setTimeout(() => setSaved(true), 600);
    return () => clearTimeout(t);
  }, [zoom, page]);

  return (
    <div className="h-14 px-4 flex items-center justify-between">
      {/* Left spacer (kept empty to visually center the tool group) */}
      <div className="w-[220px]" />

      {/* Center tools */}
      <div className="flex items-center gap-2">
        <ToolButton icon={<MousePointer2 size={18} />} label="Select" active />
        <ToolButton icon={<TypeIcon size={18} />} label="Text" />
        <ToolButton icon={<Square size={18} />} label="Rect" />
        <ToolButton icon={<Circle size={18} />} label="Ellipse" />
        <ToolButton icon={<Eraser size={18} />} label="Erase" />
      </div>

      {/* Right cluster: Zoom + Page + Saved all together */}
      <div className="flex items-center">
        <div className="flex items-center gap-3 rounded-xl border bg-white px-3 py-1.5 shadow-sm">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Zoom</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(z => Math.max(25, z - 25))}
                className="px-2 py-0.5 rounded-md hover:bg-neutral-100 text-sm"
                aria-label="Zoom out"
              >−</button>
              <span className="min-w-10 text-center text-sm tabular-nums">{zoom}%</span>
              <button
                onClick={() => setZoom(z => Math.min(400, z + 25))}
                className="px-2 py-0.5 rounded-md hover:bg-neutral-100 text-sm"
                aria-label="Zoom in"
              >+</button>
            </div>
          </div>

          <div className="h-5 w-px bg-neutral-200" />

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Page</span>
            <span className="text-sm tabular-nums">
              {page.index}/{page.total}
            </span>
          </div>

          <div className="h-5 w-px bg-neutral-200" />

          <div className="flex items-center gap-1">
            <Save size={16} className={clsx(saved ? "opacity-70" : "opacity-100")} />
            <span className="text-sm">{saved ? "Saved" : "Saving…"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={clsx(
        "flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm shadow-sm",
        active ? "bg-neutral-900 text-white border-neutral-900" : "bg-white hover:bg-neutral-50"
      )}
      type="button"
      title={label}
      aria-label={label}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}