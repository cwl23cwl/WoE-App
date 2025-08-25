"use client";
import * as React from "react";
import clsx from "clsx";

export function Separator({
  orientation = "horizontal",
  className,
}: {
  orientation?: "horizontal" | "vertical";
  className?: string;
}) {
  return (
    <div
      className={clsx(
        orientation === "vertical" ? "h-4 w-px" : "h-px w-full",
        "bg-white/10",
        className
      )}
    />
  );
}
