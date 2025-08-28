"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import StaticSvgBoard from "@/components/StaticSvgBoard";

import { Button } from "@/components/ui/Button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";

type BoardBackground = "none" | "grid" | "ruled" | "pdf";
type PageMeta = { id: string; title: string };
type ID = string;

type TextEl = {
  id: ID; type: "text"; x: number; y: number; text: string; fontSize: number; fontFamily: string; wrapWidth: number;
  hasBox: boolean; boxPadding: number; boxRadius: number; boxStroke: number; boxStrokeColor: string; boxFill: string | null;
};
type AnyEl = TextEl;

function uid() { return Math.random().toString(36).slice(2, 10); }

function useTextMeasurer() {
  const ref = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const el = document.createElement("div");
    el.style.position = "fixed"; el.style.left = "-10000px"; el.style.top = "-10000px";
    el.style.visibility = "hidden"; el.style.pointerEvents = "none";
    el.style.whiteSpace = "pre-wrap"; el.style.wordBreak = "break-word"; el.style.lineHeight = "1.2";
    document.body.appendChild(el); ref.current = el;
    return () => { document.body.removeChild(el); ref.current = null; };
  }, []);
  function measure(text: string, fontSize: number, fontFamily: string, wrapWidth: number) {
    if (!ref.current) return { width: 0, height: 0 };
    const el = ref.current; el.style.font = `${fontSize}px ${fontFamily}`; el.style.width = `${wrapWidth}px`; el.textContent = text || " ";
    const r = el.getBoundingClientRect(); return { width: r.width, height: r.height };
  }
  return { measure };
}

export default function WorkspaceClient() {
  const [pages, setPages] = useState<PageMeta[]>([{ id: "p1", title: "Page 1" }, { id: "p2", title: "Page 2" }]);
  const [activePageId, setActivePageId] = useState(pages[0].id);

  const [boardWidth, setBoardWidth] = useState(1200);
  const [boardHeight, setBoardHeight] = useState(800);
  const [boardPadding, setBoardPadding] = useState(24);
  const [background, setBackground] = useState<BoardBackground>("none");
  const [prompt, setPrompt] = useState(
    "You wake up and switched places with your teacher for one day. What would you teach and how would the day go?"
  );

  const [elements, setElements] = useState<AnyEl[]>(() => [{
    id: uid(), type: "text", x: 260, y: 260,
    text: "You wake up and find you switched places with your teacher for one day.\nDescribe what you would teach and how the day would go.",
    fontSize: 28, fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    wrapWidth: 660, hasBox: true, boxPadding: 16, boxRadius: 12, boxStroke: 1, boxStrokeColor: "#1f2937",
    boxFill: "rgba(255,255,0,0.18)",
  }]);
  const [selectedId, setSelectedId] = useState<ID | null>(elements[0]?.id ?? null);
  const selected = useMemo(() => elements.find((e) => e.id === selectedId) ?? null, [elements, selectedId]);

  const [isEditingText, setIsEditingText] = useState(false);
  const [floating, setFloating] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const floatingRef = useRef<HTMLTextAreaElement | null>(null);
  const { measure } = useTextMeasurer();

  function patch<T extends AnyEl>(id: ID, fn: (prev: T) => T) { setElements((els) => els.map((e) => (e.id === id ? fn(e as T) : e))); }

  const onUndo = useCallback(() => alert("Undo (stub)"), []);
  const onRedo = useCallback(() => alert("Redo (stub)"), []);
  const onDuplicatePage = useCallback(() => {
    const src = pages.find((p) => p.id === activePageId); if (!src) return;
    const copy: PageMeta = { id: crypto.randomUUID(), title: `${src.title} (copy)` };
    setPages((prev) => { const i = prev.findIndex((p) => p.id === activePageId); const next = [...prev]; next.splice(i + 1, 0, copy); return next; });
    setActivePageId(copy.id);
  }, [pages, activePageId]);
  const onDeletePage = useCallback(() => {
    if (pages.length <= 1) return;
    const i = pages.findIndex((p) => p.id === activePageId); const next = pages.filter((p) => p.id !== activePageId);
    setPages(next); setActivePageId(next[Math.max(0, i - 1)].id);
  }, [pages, activePageId]);
  const onAddPage = useCallback(() => {
    const page: PageMeta = { id: crypto.randomUUID(), title: `Page ${pages.length + 1}` };
    setPages((prev) => [...prev, page]); setActivePageId(page.id);
  }, [pages.length]);

  function createText() {
    const t: TextEl = {
      id: uid(), type: "text", x: 260, y: 520, text: "New text…", fontSize: 28,
      fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
      wrapWidth: 660, hasBox: false, boxPadding: 16, boxRadius: 12, boxStroke: 1, boxStrokeColor: "#1f2937", boxFill: null,
    };
    setElements((els) => [...els, t]); setSelectedId(t.id); setIsEditingText(true);
  }
  function toggleBoxForSelected() { if (!selectedId) return; patch<TextEl>(selectedId, (p) => ({ ...p, hasBox: !p.hasBox })); }

  const drag = useRef<{ id: ID; startX: number; startY: number; baseX: number; baseY: number } | null>(null);
  function onPointerDown(e: React.PointerEvent, id: ID) {
    if ((e.target as HTMLElement).closest?.("[data-textarea]")) return;
    const el = elements.find((x) => x.id === id) as TextEl | undefined; if (!el) return;
    setSelectedId(id); setIsEditingText(false);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    drag.current = { id, startX: e.clientX, startY: e.clientY, baseX: el.x, baseY: el.y };
  }
  function onPointerMove(e: React.PointerEvent) {
    if (!drag.current) return;
    const { id, startX, startY, baseX, baseY } = drag.current;
    const dx = e.clientX - startX; const dy = e.clientY - startY;
    patch<TextEl>(id, (p) => ({ ...p, x: baseX + dx, y: baseY + dy }));
  }
  function onPointerUp(e: React.PointerEvent) { if (!drag.current) return; (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId); drag.current = null; }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!selected || selected.type !== "text") return;
      if (e.key === "Enter" && !isEditingText) { e.preventDefault(); setIsEditingText(true); }
      if ((e.key === "Delete" || e.key === "Backspace") && !isEditingText) { setElements((els) => els.filter((x) => x.id !== selected.id)); setSelectedId(null); }
    }
    window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey);
  }, [selected, isEditingText]);

  useEffect(() => {
    if (!selected || selected.type !== "text") { setFloating(null); return; }
    const m = measure(selected.text, selected.fontSize, selected.fontFamily, selected.wrapWidth);
    setFloating({ x: selected.x, y: selected.y, w: selected.wrapWidth, h: Math.max(40, m.height) });
    if (isEditingText) setTimeout(() => floatingRef.current?.focus(), 0);
  }, [isEditingText, selected, measure]);

  function commitText(val: string) { if (!selectedId) return; patch<TextEl>(selectedId, (p) => ({ ...p, text: val })); }

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-support-navy text-white">
      {/* Left rail: Pages */}
      <aside className="w-56 shrink-0 border-r border-white/10 bg-support-navy/60">
        <div className="px-3 py-2 text-xs uppercase tracking-wide text-white/60">Pages</div>
        <nav className="flex flex-col gap-1 p-2">
          {pages.map((p) => {
            const active = p.id === activePageId;
            return (
              <Button
                key={p.id}
                variant={active ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActivePageId(p.id)}
              >
                {p.title}
              </Button>
            );
          })}
        </nav>
        <div className="mt-auto p-2">
          <Button onClick={onAddPage} className="w-full" variant="default">
            + New page
          </Button>
        </div>
      </aside>

      {/* Main column */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top toolbar */}
        <header className="flex items-center gap-2 border-b border-white/10 bg-support-navy px-3 py-2">
          <div className="text-sm font-semibold">
            {pages.find((p) => p.id === activePageId)?.title ?? "Untitled"}
          </div>

          <Separator orientation="vertical" className="mx-2 h-4" />

          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={onUndo}>⟲ Undo</Button>
            <Button size="sm" variant="ghost" onClick={onRedo}>⟳ Redo</Button>
          </div>

          <Separator orientation="vertical" className="mx-2 h-4" />

          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={onDuplicatePage}>Duplicate</Button>
            <Button size="sm" variant="ghost" onClick={onDeletePage}>Delete</Button>
          </div>

          <div className="ml-auto" />

          {/* Tools */}
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" title="Select">Select</Button>
            <Button size="sm" variant="ghost" title="Text" onClick={createText}>Text</Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="ghost" title="Border & Background">Box</Button>
              </PopoverTrigger>
              <PopoverContent className="w-72">
                <div className="flex flex-col gap-3 text-sm">
                  <div className="text-xs uppercase tracking-wide text-white/70">Border & Background</div>

                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-white/80">Fill</Label>
                    <Select
                      value={selected && selected.type === "text" && selected.boxFill ? "custom" : "none"}
                      onValueChange={(v) => {
                        if (!selectedId) return;
                        const val = v === "none" ? null : "rgba(255,255,0,0.18)";
                        patch<TextEl>(selectedId, (p) => ({ ...p, hasBox: true, boxFill: val }));
                      }}
                    >
                      <SelectTrigger className="w-36" />
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        <SelectItem value="custom">Soft Yellow</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-white/80">Padding</Label>
                    <Slider
                      className="w-40"
                      min={8}
                      max={40}
                      step={1}
                      value={[selected && selected.type === "text" ? selected.boxPadding : 16]}
                      onValueChange={(vals) => {
                        if (!selectedId) return;
                        patch<TextEl>(selectedId, (p) => ({ ...p, hasBox: true, boxPadding: vals[0] }));
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-white/80">Corner</Label>
                    <Slider
                      className="w-40"
                      min={0}
                      max={32}
                      step={1}
                      value={[selected && selected.type === "text" ? selected.boxRadius : 12]}
                      onValueChange={(vals) => {
                        if (!selectedId) return;
                        patch<TextEl>(selectedId, (p) => ({ ...p, hasBox: true, boxRadius: vals[0] }));
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-white/80">Border</Label>
                    <Slider
                      className="w-40"
                      min={0}
                      max={6}
                      step={1}
                      value={[selected && selected.type === "text" ? selected.boxStroke : 1]}
                      onValueChange={(vals) => {
                        if (!selectedId) return;
                        patch<TextEl>(selectedId, (p) => ({ ...p, hasBox: true, boxStroke: vals[0] }));
                      }}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <Button size="sm" variant="ghost" title="Toggle Box" onClick={toggleBoxForSelected}>☐/■</Button>
          </div>
        </header>

        {/* Canvas + Inspector */}
        <section className="flex min-h-0 flex-1">
          {/* Canvas */}
          <div className="relative min-w-0 flex-1 overflow-auto p-4">
            <div className="mx-auto max-w-[1600px]">
              <div className="relative rounded-2xl border border-white/10 bg-support-navy/40 p-4" style={{ width: "fit-content" }}>
                <StaticSvgBoard width={boardWidth} height={boardHeight} padding={boardPadding} background={background} prompt={prompt} />

                <svg width={boardWidth} height={boardHeight} className="absolute left-4 top-4" onPointerMove={onPointerMove} onPointerUp={onPointerUp}>
                  {elements.map((el) => {
                    if (el.type !== "text") return null;
                    const m = measure(el.text, el.fontSize, el.fontFamily, el.wrapWidth);
                    const pad = el.hasBox ? el.boxPadding : 0;
                    const boxX = el.x - pad; const boxY = el.y - pad;
                    const boxW = el.wrapWidth + pad * 2; const boxH = Math.max(40, m.height) + pad * 2;

                    return (
                      <g key={el.id} onPointerDown={(e) => onPointerDown(e, el.id)} style={{ cursor: "move" }}>
                        {el.hasBox && (
                          <rect
                            x={boxX} y={boxY} width={boxW} height={boxH}
                            rx={el.boxRadius} ry={el.boxRadius}
                            fill={el.boxFill ?? "transparent"}
                            stroke={el.boxStroke > 0 ? el.boxStrokeColor : "transparent"}
                            strokeWidth={el.boxStroke}
                          />
                        )}

                        <foreignObject x={el.x} y={el.y} width={el.wrapWidth} height={Math.max(40, m.height)}>
                          <div
                            style={{
                              font: `${el.fontSize}px ${el.fontFamily}`,
                              lineHeight: 1.2,
                              color: "white",
                              whiteSpace: "pre-wrap",
                              wordBreak: "break-word",
                              userSelect: "none",
                              pointerEvents: "none",
                            }}
                          >
                            {el.text}
                          </div>
                        </foreignObject>

                        {selectedId === el.id && (
                          <rect
                            x={boxX - 4} y={boxY - 4} width={boxW + 8} height={boxH + 8}
                            fill="none" stroke="#60a5fa" strokeDasharray="6 6" strokeWidth={2} pointerEvents="none"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {isEditingText && selected && selected.type === "text" && floating && (
                  <Textarea
                    ref={floatingRef as any}
                    data-textarea
                    defaultValue={selected.text}
                    onBlur={(e: any) => { commitText(e.currentTarget.value); setIsEditingText(false); }}
                    onKeyDown={(e: any) => { if (e.key === "Escape") { e.preventDefault(); setIsEditingText(false); } }}
                    className="absolute border-2 border-primary bg-white/95 p-2 text-neutral-900"
                    style={{
                      left: 16 + floating.x, top: 16 + floating.y, width: floating.w, height: floating.h,
                      font: `${selected.fontSize}px ${selected.fontFamily}`, lineHeight: "1.2", resize: "both", zIndex: 45,
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Inspector */}
          <aside className="w-72 shrink-0 border-l border-white/10 bg-support-navy/60">
            <div className="px-3 py-2 text-xs uppercase tracking-wide text-white/60">Inspector</div>
            <div className="flex flex-col gap-3 p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <Label>Width</Label>
                <Input type="number" value={boardWidth} onChange={(e) => setBoardWidth(Math.max(300, Number(e.target.value) || 0))} className="w-28" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <Label>Height</Label>
                <Input type="number" value={boardHeight} onChange={(e) => setBoardHeight(Math.max(300, Number(e.target.value) || 0))} className="w-28" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <Label>Padding</Label>
                <Input type="number" value={boardPadding} onChange={(e) => setBoardPadding(Math.max(0, Number(e.target.value) || 0))} className="w-28" />
              </div>

              <div className="flex items-center justify-between gap-2">
                <Label>Background</Label>
                <Select value={background} onValueChange={(v) => setBackground(v as BoardBackground)}>
                  <SelectTrigger className="w-32" />
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="ruled">Ruled</SelectItem>
                    <SelectItem value="pdf">PDF Page</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Prompt</Label>
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} className="min-h-[96px]" />
              </div>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}