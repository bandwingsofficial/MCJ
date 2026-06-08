import * as React from "react";

import { cn } from "@/src/shared/lib/cn";

interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

export function Label({
  children,
  required,
  className,
  ...props
}: LabelProps) {
  return (
    <label
      className={cn(
        "mb-2 inline-flex items-center gap-1 text-sm font-medium text-slate-700",
        className
      )}
      {...props}
    >
      {children}

      {required && (
        <span className="text-red-500">*</span>
      )}
    </label>
  );
}