"use client";

import React from "react";
import {
  MousePointer2,
  PencilLine,
  Type as TypeIcon,
  Eraser,
  Highlighter,
} from "lucide-react";

import {
  getWoeToolManager,
  type WoeToolType,
} from "@/lib/woe-tool-manager";

import {
  PEN_SWATCHES,
  TEXT_SWATCHES,
  HIGHLIGHTER_SWATCHES,
  type ColorSwatch,
} from "@/lib/workspace-swatches";

/** Pencil in your brand tokens via Tailwind (mapped to CSS vars):
 *  - bg-card bg-background border-border text-foreground
 *  - text-primary ring-primary accent-primary shadow-brand
 */

const TOOL_ICONS: Record<WoeToolType, React.ReactNode> = {
  select: <MousePointer2 size={18} />,
  draw: <PencilLine size={18} />,         // "pencil"
  text: <TypeIcon size={18} />,
  erase: <Eraser size={18} />,
  highlighter: <Highlighter size={18} />,
};

const TOOL_LABELS: Record<WoeToolType, string> = {
  select: "Select",
  draw: "Pencil",
  text: "Text",
  erase: "Eraser",
  highlighter: "Highlighter",
};

// UI helper: match your screenshot “selected pill” look
function ToolButton({
  tool,
  active,
  onClick,
}: {
  tool: WoeToolType;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "flex items-center gap-2 rounded-2xl px-3 py-2",
        "border transition-colors select-none",
        active
          ? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20"
          : "bg-card text-foreground border-border hover:bg-muted/40",
      ].join(" ")}
    >
      {TOOL_ICONS[tool]}
      <span className="text-sm">{TOOL_LABELS[tool]}</span>
    </button>
  );
}

function useToolManager() {
  const mgr = React.useMemo(() => getWoeToolManager(), []);
  const [active, setActive] = React.useState<WoeToolType>(mgr.getActiveTool());
  const [prefs, setPrefs] = React.useState(mgr.getToolPrefs());

  React.useEffect(() => {
    const off = mgr.onToolChange(() => {
      setActive(mgr.getActiveTool());
      setPrefs(mgr.getToolPrefs());
    });
    return off;
  }, [mgr]);

  const setTool = (t: WoeToolType) => mgr.setActiveTool(t);

  const setPenWidth = (n: number) => {
    const t = mgr.getActiveTool();
    if (t === "highlighter") mgr.updateToolPrefs({ highlighterSize: n });
    else mgr.updateToolPrefs({ drawSize: n });
    setPrefs(mgr.getToolPrefs());
  };

  const setColor = (hex: string) => {
    const t = mgr.getActiveTool();
    if (t === "text") mgr.setTextColor(hex);
    else if (t === "highlighter") mgr.updateToolPrefs({ highlighterColor: hex });
    else mgr.updateToolPrefs({ drawColor: hex });
    setPrefs(mgr.getToolPrefs());
  };

  // convenient getters
  const penWidth =
    active === "highlighter" ? prefs.highlighterSize : prefs.drawSize;
  const currentColor =
    active === "text"
      ? prefs.textColor
      : active === "highlighter"
      ? prefs.highlighterColor
      : prefs.drawColor;

  return { active, prefs, setTool, setPenWidth, setColor, penWidth, currentColor };
}

function SwatchGrid({
  colorSet,
  current,
  onPick,
}: {
  colorSet: ColorSwatch[];
  current: string;
  onPick: (hex: string) => void;
}) {
  return (
    <div className="grid grid-cols-8 gap-2 p-2 rounded-xl border border-border bg-card shadow-brand">
      {colorSet.map((s) => (
        <button
          key={s.hex}
          type="button"
          title={s.name}
          onClick={() => onPick(s.hex)}
          className={[
            "h-6 w-6 rounded-md border",
            s.hex.toLowerCase() === current.toLowerCase()
              ? "ring-2 ring-primary border-primary"
              : "border-border",
          ].join(" ")}
          style={{ background: s.hex }}
        />
      ))}
    </div>
  );
}

export default function WorkspaceToolbar() {
  const { active, setTool, penWidth, setPenWidth, setColor, currentColor } =
    useToolManager();

  // Which palette to show depends on active tool
  const palette =
    active === "text"
      ? TEXT_SWATCHES
      : active === "highlighter"
      ? HIGHLIGHTER_SWATCHES
      : PEN_SWATCHES;

  // simple popover for color palette
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => setOpen(false), [active]);

  return (
    <div className="w-full rounded-2xl border border-border bg-background shadow-brand">
      <div className="flex items-center justify-between px-3 py-2">
        {/* Left: tools */}
        <div className="flex items-center gap-2">
          <ToolButton tool="select" active={active === "select"} onClick={() => setTool("select")} />
          <ToolButton tool="draw" active={active === "draw"} onClick={() => setTool("draw")} />
          <ToolButton tool="text" active={active === "text"} onClick={() => setTool("text")} />
          <ToolButton tool="erase" active={active === "erase"} onClick={() => setTool("erase")} />
          <ToolButton
            tool="highlighter"
            active={active === "highlighter"}
            onClick={() => setTool("highlighter")}
          />
        </div>

        {/* Right: color + width (matches your screenshot layout) */}
        <div className="flex items-center gap-3">
          {/* current color swatch */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="h-7 w-7 rounded-md border border-border"
              aria-label="Pick color"
              style={{ background: currentColor }}
            />
            {open && (
              <div className="absolute right-0 z-20 mt-2">
                <SwatchGrid
                  colorSet={palette}
                  current={currentColor}
                  onPick={(hex) => {
                    setColor(hex);
                    setOpen(false);
                  }}
                />
              </div>
            )}
          </div>

          <span className="text-sm text-foreground/80">Pen</span>
          <span className="text-sm text-foreground/80">Width:</span>

          <input
            type="range"
            min={1}
            max={24}
            value={penWidth}
            onChange={(e) => setPenWidth(parseInt(e.target.value, 10))}
            className="accent-primary w-48"
          />
        </div>
      </div>
    </div>
  );
}
