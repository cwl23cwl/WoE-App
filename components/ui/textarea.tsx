"use client";
import * as React from "react";
import clsx from "clsx";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={clsx(
          "min-h-[80px] w-full rounded-md border bg-support-navy/30 p-2 text-sm",
          "border-white/10 text-white placeholder:text-neutral-400",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
