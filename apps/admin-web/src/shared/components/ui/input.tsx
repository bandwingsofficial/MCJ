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
        "flex h-[46px] w-full rounded-xl border border-[#DCE8F5]",
        "bg-white px-4 py-2 text-sm text-[#102A56]",
        "placeholder:text-[#8AA0BB]",
        "focus:outline-none",
        "focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
