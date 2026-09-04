import * as React from "react";

import { cn } from "@/src/shared/lib/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<
  HTMLInputElement,
  InputProps
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-xl border border-slate-300",
        "bg-white px-4 py-2 text-sm",
        "placeholder:text-slate-400",
        "focus:outline-none",
        "focus:ring-2 focus:ring-[#2563D9]/40",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";