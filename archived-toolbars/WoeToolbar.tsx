// app/components/WoeToolbar.tsx
"use client";
import React from "react";
import { WoeToolManager, type WoeToolType } from "@/lib/woe-tool-manager";
import { WORKSPACE_DEFAULTS } from "@/lib/workspace-defaults";
import { PEN_SWATCHES, TEXT_SWATCHES, HIGHLIGHTER_SWATCHES, type ColorSwatch } from "@/lib/workspace-swatches";
import { cn } from "@/lib/utils";
import { Undo2, Redo2, ZoomIn, ZoomOut, MousePointer, Pencil, Type, Eraser, Highlighter } from "lucide-react";

/**
 * Minimal, centered top toolbar styled with Tailwind.
 * - Icon buttons for Select / Draw / Text / Erase / Highlighter
 * - Swatches for the active tool (pen/text/highlighter)
 * - Size slider when Draw or Highlighter is active
 * - Undo/Redo, Zoom controls, Page indicator, Save status cluster on the right
 *
 * This component is intentionally self-contained and only talks to your
 * existing lib/ via WoeToolManager + swatch lists. No font files required.
 */

function getToolName(tool: WoeToolType) {
  switch (tool) {
    case "select":
      return "Select";
    case "draw":
      return "Draw";
    case "text":
      return "Text";
    case "highlighter":
      return "Highlighter";
    case "erase":
      return "Eraser";
    default:
      return "Tool";
  }
}

export default function WoeToolbar(props: {
  toolManager?: WoeToolManager; // pass one in, or we create a singleton
  onUndo?: () => void;
  onRedo?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  zoom?: number;
  page?: { index: number; total: number };
  saveState?: "saved" | "saving" | "dirty";
}) {
  const tm = React.useMemo(() => props.toolManager ?? new WoeToolManager(), [props.toolManager]);

  // Self-managed state (no tm.subscribe needed)
  const [activeTool, setActiveTool] = React.useState<WoeToolType>(tm.getActiveTool());
  const [prefs, setPrefs] = React.useState(tm.getToolPrefs());

  // Pick which swatch list to show based on active tool
  const swatches: ColorSwatch[] = React.useMemo(() => {
    if (activeTool === "draw") return PEN_SWATCHES;
    if (activeTool === "text") return TEXT_SWATCHES;
    if (activeTool === "highlighter") return HIGHLIGHTER_SWATCHES;
    return [];
  }, [activeTool]);

  return (
    <div className="w-full border-b border-neutral-800/40 bg-neutral-950/70 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/50">
      <div className="mx-auto max-w-6xl px-3">
        {/* Top row: centered tool group + right-side system cluster */}
        <div className="flex items-center justify-between py-2">
          <div className="flex-1" />

          <div className="flex items-center gap-2 rounded-2xl border border-neutral-800/50 bg-neutral-900/60 px-2 py-1 shadow-sm">
            <ToolButton
              icon={<MousePointer className="size-4" />}
              label="Select"
              active={activeTool === "select"}
              onClick={() => { tm.setActiveTool("select"); setActiveTool("select"); }}
            />
            <Divider />
            <ToolButton
              icon={<Pencil className="size-4" />}
              label="Draw"
              active={activeTool === "draw"}
              onClick={() => { tm.setActiveTool("draw"); setActiveTool("draw"); }}
            />
            <ToolButton
              icon={<Type className="size-4" />}
              label="Text"
              active={activeTool === "text"}
              onClick={() => { tm.setActiveTool("text"); setActiveTool("text"); }}
            />
            <ToolButton
              icon={<Highlighter className="size-4" />}
              label="Highlight"
              active={activeTool === "highlighter"}
              onClick={() => { tm.setActiveTool("highlighter"); setActiveTool("highlighter"); }}
            />
            <ToolButton
              icon={<Eraser className="size-4" />}
              label="Erase"
              active={activeTool === "erase"}
              onClick={() => { tm.setActiveTool("erase"); setActiveTool("erase"); }}
            />
          </div>

          <div className="flex items-center gap-2">
            <IconButton ariaLabel="Undo" onClick={props.onUndo}><Undo2 className="size-4" /></IconButton>
            <IconButton ariaLabel="Redo" onClick={props.onRedo}><Redo2 className="size-4" /></IconButton>
            <div className="ml-2 flex items-center gap-1 rounded-full border border-neutral-800/50 bg-neutral-900/60 px-1 py-1">
              <IconButton ariaLabel="Zoom out" onClick={props.onZoomOut}><ZoomOut className="size-4" /></IconButton>
              <span className="min-w-10 text-center text-xs tabular-nums text-neutral-300">
                {Math.round((props.zoom ?? WORKSPACE_DEFAULTS.zoom) * 100)}%
              </span>
              <IconButton ariaLabel="Zoom in" onClick={props.onZoomIn}><ZoomIn className="size-4" /></IconButton>
            </div>
            <PageBadge index={props.page?.index ?? 1} total={props.page?.total ?? 1} />
            <SaveChip state={props.saveState ?? "saved"} />
          </div>
        </div>

        {/* Bottom row: dynamic controls for the active tool */}
        {(activeTool === "draw" || activeTool === "text" || activeTool === "highlighter") && (
          <div className="flex flex-wrap items-center gap-3 pb-2">
            {/* Swatches */}
            <div className="flex items-center gap-1">
              {swatches.map((s) => (
                <button
                  key={s.hex}
                  className={cn(
                    "size-6 rounded-full ring-1 ring-inset ring-neutral-800",
                    s.hex.toLowerCase() ===
                      (activeTool === "draw"
                        ? prefs.drawColor.toLowerCase()
                        : activeTool === "text"
                        ? prefs.textColor.toLowerCase()
                        : prefs.highlighterColor.toLowerCase()) &&
                      "ring-2 ring-white"
                  )}
                  style={{ background: s.hex, opacity: activeTool === "highlighter" ? 0.8 : 1 }}
                  onClick={() => {
                    if (activeTool === "draw") { tm.updateToolPrefs({ drawColor: s.hex }); setPrefs(p => ({ ...p, drawColor: s.hex })); }
                    if (activeTool === "text") { tm.updateToolPrefs({ textColor: s.hex }); setPrefs(p => ({ ...p, textColor: s.hex })); }
                    if (activeTool === "highlighter") { tm.updateToolPrefs({ highlighterColor: s.hex }); setPrefs(p => ({ ...p, highlighterColor: s.hex })); }
                  }}
                  title={`${s.name} ${s.hex}`}
                  aria-label={`Set ${getToolName(activeTool)} color to ${s.name}`}
                />
              ))}
            </div>

            {/* Size slider for draw + highlighter */}
            {(activeTool === "draw" || activeTool === "highlighter") && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400">Size</span>
                <input
                  type="range"
                  min={1}
                  max={24}
                  step={1}
                  className="h-1 w-40 cursor-pointer appearance-none rounded-full bg-neutral-800"
                  value={activeTool === "draw" ? prefs.drawSize : prefs.highlighterSize}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (activeTool === "draw") { tm.updateToolPrefs({ drawSize: v }); setPrefs(p => ({ ...p, drawSize: v })); }
                    else { tm.updateToolPrefs({ highlighterSize: v }); setPrefs(p => ({ ...p, highlighterSize: v })); }
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Divider() {
  return <div className="mx-1 h-6 w-px bg-neutral-800" />;
}

function ToolButton(props: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "group inline-flex items-center gap-1 rounded-xl px-2 py-1 text-xs text-neutral-300 transition",
        props.active
          ? "bg-white/10 text-white ring-1 ring-white/20"
          : "hover:bg-white/5 hover:text-white"
      )}
      aria-pressed={props.active}
      aria-label={props.label}
      title={props.label}
    >
      {props.icon}
      <span className="hidden sm:inline">{props.label}</span>
    </button>
  );
}

function IconButton(props: { ariaLabel: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      className="inline-flex size-7 items-center justify-center rounded-full text-neutral-300 hover:bg-white/5 hover:text-white"
      aria-label={props.ariaLabel}
      onClick={props.onClick}
      title={props.ariaLabel}
    >
      {props.children}
    </button>
  );
}

function PageBadge(props: { index: number; total: number }) {
  return (
    <div className="ml-1 rounded-full border border-neutral-800/50 bg-neutral-900/60 px-2 py-0.5 text-xs text-neutral-300">
      Page {props.index} / {props.total}
    </div>
  );
}

function SaveChip(props: { state: "saved" | "saving" | "dirty" }) {
  const text = props.state === "saving" ? "Saving…" : props.state === "dirty" ? "Edited" : "Saved";
  const dot = props.state === "saving" ? "animate-pulse" : props.state === "dirty" ? "" : "";
  return (
    <div className="ml-1 inline-flex items-center gap-1 rounded-full border border-neutral-800/50 bg-neutral-900/60 px-2 py-0.5 text-xs text-neutral-300">
      <span className={cn("inline-block size-1.5 rounded-full", dot, props.state === "dirty" ? "bg-amber-400" : props.state === "saving" ? "bg-sky-400" : "bg-emerald-400")} />
      {text}
    </div>
  );
}

// Example usage inside a page/layout:
// <WoeToolbar
//   toolManager={toolManager}
//   onUndo={() => excalidrawAPI.undo()}
//   onRedo={() => excalidrawAPI.redo()}
//   onZoomIn={() => setZoom((z)=>Math.min(3, z + 0.1))}
//   onZoomOut={() => setZoom((z)=>Math.max(0.25, z - 0.1))}
//   zoom={zoom}
//   page={{ index: currentPage, total: totalPages }}
//   saveState={saveState}
// />
