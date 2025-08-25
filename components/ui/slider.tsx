"use client";
import * as React from "react";
import clsx from "clsx";

/**
 * Minimal Slider shim (1-thumb):
 * Usage: <Slider value={[num]} min={0} max={10} step={1} onValueChange={(v)=>...} />
 * Renders a native <input type="range"> under the hood.
 */

type Props = {
  value: number[];
  onValueChange?: (v: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  className?: string;
};

export function Slider({ value, onValueChange, min = 0, max = 100, step = 1, className }: Props) {
  const v = Array.isArray(value) && value.length ? value[0] : min;
  return (
    <input
      type="range"
      className={clsx("h-2 w-full cursor-pointer rounded bg-neutral-800", className)}
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onValueChange?.([Number(e.currentTarget.value)])}
    />
  );
}
