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
        "min-h-[120px] w-full rounded-xl border border-[#DCE8F5] bg-white",
        "px-4 py-3",
        "text-sm text-[#102A56] placeholder:text-[#8AA0BB]",
        "focus:outline-none",
        "focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20",
        className
      )}
      {...props}
    />
  );
});

Textarea.displayName = "Textarea";