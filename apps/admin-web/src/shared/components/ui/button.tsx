"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;

  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "danger"
    | "success"
    | "ghost";

  size?: "sm" | "md" | "lg";
}

const variantClasses = {
  primary:
    "bg-[#2563EB] text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:bg-[#1D4ED8] hover:shadow-[0_6px_16px_rgba(37,99,235,0.24)]",

  secondary:
    "bg-[#F4F9FF] text-[#102A56] hover:bg-[#EAF4FF]",

  outline:
    "border border-[#DCE8F5] bg-white text-[#102A56] hover:bg-[#F8FBFF]",

  danger:
    "bg-rose-600 text-white hover:bg-rose-700",

  success:
    "bg-emerald-600 text-white hover:bg-emerald-700",

  ghost:
    "hover:bg-[#F4F9FF]",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",

  md: "h-11 px-5 text-sm",

  lg: "h-[52px] px-5 text-sm",
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      aria-busy={loading}
      disabled={loading || disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[14px] font-medium transition-all",
        "focus:outline-none focus:ring-2 focus:ring-[#2563EB]/30",
        "disabled:pointer-events-none disabled:opacity-50",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {loading && (
        <Loader2 className="h-4 w-4 animate-spin" />
      )}

      {children}
    </button>
  );
}
