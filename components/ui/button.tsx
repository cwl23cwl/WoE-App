// components/ui/Button.tsx
"use client";

import * as React from "react";
import clsx from "clsx";

type Variant = "primary" | "outline" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  asChild?: boolean; // future-proof for Slot patterns
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={clsx(
        "btn", // superdesign base
        variant === "primary" && "btn-primary",
        variant === "outline" && "btn-outline",
        variant === "ghost" && "btn-ghost",
        variant === "destructive" && "btn-destructive",
        size === "sm" && "btn-sm",
        size === "lg" && "btn-lg",
        className
      )}
    />
  );
}
