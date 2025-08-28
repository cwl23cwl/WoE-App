// components/ui/Input.tsx
import * as React from "react";
import clsx from "clsx";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={clsx("form-input", className)} {...props} />;
  }
);
Input.displayName = "Input";
