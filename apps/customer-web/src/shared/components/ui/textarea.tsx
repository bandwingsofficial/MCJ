import * as React from "react";

import { cn } from "@/src/shared/lib/cn";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  TextareaProps
>(({ className, ...props }, ref) => {
  return (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full rounded-xl border border-slate-300",
        "px-4 py-3",
        "text-sm",
        "focus:outline-none",
        "focus:ring-2 focus:ring-[#2563D9]/40",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";