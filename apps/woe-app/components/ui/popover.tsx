"use client";
import * as React from "react";
import clsx from "clsx";

type Ctx = { open: boolean; setOpen: (v: boolean) => void; anchorRect: DOMRect | null; setAnchorRect: (r: DOMRect | null) => void };
const PopCtx = React.createContext<Ctx | null>(null);
function usePop() { const c = React.useContext(PopCtx); if (!c) throw new Error("Popover parts must be inside <Popover>"); return c; }

export function Popover({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest?.("[data-popover]") || t.closest?.("[data-popover-trigger]")) return;
      setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onDown);
    return () => { window.removeEventListener("keydown", onKey); window.removeEventListener("mousedown", onDown); };
  }, [open]);

  return <PopCtx.Provider value={{ open, setOpen, anchorRect, setAnchorRect }}>{children}</PopCtx.Provider>;
}

export function PopoverTrigger({ asChild, children }: { asChild?: boolean; children: React.ReactElement }) {
  const { open, setOpen, setAnchorRect } = usePop();
  const handleClick = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setAnchorRect(rect);
    setOpen(!open);
    if (children.props?.onClick) children.props.onClick(e);
  };
  return asChild ? React.cloneElement(children, { onClick: handleClick, "data-popover-trigger": "" }) : (
    <button onClick={handleClick} data-popover-trigger="">{children}</button>
  );
}

export function PopoverContent({ className, children, sideOffset = 8 }: { className?: string; children: React.ReactNode; sideOffset?: number }) {
  const { open, anchorRect } = usePop();
  if (!open || !anchorRect) return null;
  return (
    <div
      data-popover
      role="dialog"
      aria-modal="true"
      className={clsx(
        "fixed z-50 min-w-[240px] rounded-md border p-3 text-white shadow-brand",
        "bg-support-navy border-white/10",
        className
      )}
      style={{ left: anchorRect.left, top: anchorRect.bottom + sideOffset }}
    >
      {children}
    </div>
  );
}
