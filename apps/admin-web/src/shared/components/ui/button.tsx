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
    "bg-[#2447A8] text-white hover:bg-[#1E3A8A]",

  secondary:
    "bg-[#F29A2E] text-white hover:bg-[#E28718]",

  outline:
    "border border-slate-300 bg-white hover:bg-slate-50",

  danger:
    "bg-red-600 text-white hover:bg-red-700",

  success:
    "bg-emerald-600 text-white hover:bg-emerald-700",

  ghost:
    "hover:bg-slate-100",
};

const sizeClasses = {
  sm: "h-9 px-3 text-sm",

  md: "h-11 px-5 text-sm",

  lg: "h-12 px-6 text-base",
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
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-[#2447A8]",
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