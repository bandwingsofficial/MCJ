"use client";

import type { ReactNode } from "react";

import { Check, X } from "lucide-react";

import { Label } from "@/src/shared/components/ui/label";
import { cn } from "@/src/shared/lib/cn";

export type FieldVisualState =
  | "neutral"
  | "valid"
  | "invalid"
  | "checking";

interface ValidatedFieldProps {
  label: string;
  required?: boolean;
  state: FieldVisualState;
  errorMessage?: string | null;
  successMessage?: string | null;
  checkingMessage?: string;
  className?: string;
  children: ReactNode;
}

export function validatedFieldInputClass(
  state: FieldVisualState,
  extra?: string
) {
  return cn(
    "pr-10 transition-[border-color,box-shadow] duration-150",
    state === "valid" &&
      "border-emerald-400 focus:ring-emerald-500/25",
    state === "invalid" &&
      "border-red-300 shadow-[0_0_0_3px_rgba(254,202,202,0.45)] focus:ring-red-300/30",
    extra
  );
}

export function ValidatedField({
  label,
  required = false,
  state,
  errorMessage,
  successMessage,
  checkingMessage = "Checking...",
  className,
  children,
}: ValidatedFieldProps) {
  return (
    <div className={cn("min-w-0", className)}>
      <Label required={required}>{label}</Label>

      <div className="relative">
        {children}

        {state === "valid" && (
          <Check
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-emerald-600"
          />
        )}
        {state === "invalid" && (
          <X
            aria-hidden
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-red-500"
          />
        )}
      </div>

      <div className="mt-1 min-h-[1.25rem]">
        {state === "checking" ? (
          <p className="text-xs text-slate-500">
            {checkingMessage}
          </p>
        ) : state === "valid" && successMessage ? (
          <p className="text-xs text-emerald-600">
            {successMessage}
          </p>
        ) : state === "invalid" && errorMessage ? (
          <p role="alert" className="text-sm text-red-500">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}
