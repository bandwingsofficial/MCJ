"use client";

import { cn } from "@/src/shared/lib/cn";
import { InputHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-purple-500",
        "placeholder:text-gray-400",
        className
      )}
      {...props}
    />
  );
}