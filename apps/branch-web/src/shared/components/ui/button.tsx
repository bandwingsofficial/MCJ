"use client";

import { cn } from "@/src/shared/lib/cn";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  loading,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "rounded-xl font-medium transition-all flex items-center justify-center",
        "disabled:opacity-50 disabled:cursor-not-allowed",

        // variants
        variant === "primary" &&
          "bg-purple-600 text-white hover:bg-purple-700",
        variant === "secondary" &&
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        variant === "outline" &&
          "border border-gray-300 hover:bg-gray-50",
        variant === "ghost" && "hover:bg-gray-100",

        // sizes
        size === "sm" && "px-3 py-1.5 text-sm",
        size === "md" && "px-4 py-2 text-sm",
        size === "lg" && "px-6 py-3 text-base",

        className
      )}
      {...props}
    >
      {loading ? "Loading..." : children}
    </button>
  );
}