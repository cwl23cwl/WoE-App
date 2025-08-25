"use client";
import * as React from "react";
import clsx from "clsx";

type SelectItemProps = { value: string; children?: React.ReactNode };
type SelectItemElement = React.ReactElement<SelectItemProps> & { type: { displayName?: string } };
type SelectContextType = { value?: string; onValueChange?: (v: string) => void; items: { value: string; label: React.ReactNode }[] };

const SelectContext = React.createContext<SelectContextType>({ items: [] });

function isSelectItem(node: React.ReactNode): node is SelectItemElement {
  return React.isValidElement(node) && (node.type as any)?.displayName === "SelectItem";
}
function collectItems(children: React.ReactNode): { value: string; label: React.ReactNode }[] {
  const items: { value: string; label: React.ReactNode }[] = [];
  React.Children.forEach(children, (child) => {
    if (!child) return;
    if (isSelectItem(child)) {
      items.push({ value: child.props.value ?? "", label: child.props.children });
    } else if (React.isValidElement(child) && child.props?.children) {
      items.push(...collectItems(child.props.children as React.ReactNode));
    }
  });
  return items;
}

export function Select({ value, onValueChange, children }: { value?: string; onValueChange?: (v: string) => void; children: React.ReactNode }) {
  const items = React.useMemo(() => collectItems(children), [children]);
  return <SelectContext.Provider value={{ value, onValueChange, items }}>{children}</SelectContext.Provider>;
}

export function SelectTrigger({ className }: { className?: string }) {
  const ctx = React.useContext(SelectContext);
  return (
    <select
      className={clsx(
        "h-9 w-full rounded-md border px-2 text-sm",
        "bg-support-navy/30 border-white/10 text-white",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
        className
      )}
      value={ctx.value ?? ""}
      onChange={(e) => ctx.onValueChange?.(e.currentTarget.value)}
    >
      {ctx.items.map((it) => (
        <option key={it.value} value={it.value}>
          {typeof it.label === "string" || typeof it.label === "number" ? it.label : it.value}
        </option>
      ))}
    </select>
  );
}
export function SelectContent({ children }: { className?: string; children?: React.ReactNode }) { return null; }
export function SelectItem(_props: SelectItemProps) { return null; }
SelectItem.displayName = "SelectItem";
export function SelectValue(_props: { placeholder?: string }) { return null; }
