"use client";

import type { ReactNode } from "react";

import { Check, X } from "lucide-react";

import { Label } from "@/src/shared/components/ui/label";
import { Button } from "@/src/shared/components/ui/button";
import { cn } from "@/src/shared/lib/cn";
import type { FieldVisualState } from "@/src/shared/components/ui/validated-field";

interface Props {
  label: string;
  required?: boolean;
  state: FieldVisualState;
  errorMessage?: string | null;
  showReset?: boolean;
  onReset?: () => void;
  multiline?: boolean;
  children: ReactNode;
}

export function CourseMetaField({
  label,
  required = false,
  state,
  errorMessage,
  showReset = false,
  onReset,
  multiline = false,
  children,
}: Props) {
  return (
    <div className="min-w-0">
      <div className="mb-1 flex min-w-0 items-center justify-between gap-2">
        <Label required={required}>{label}</Label>
        {showReset && onReset ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto shrink-0 px-0 py-0 text-xs font-medium text-[#2447A8] hover:bg-transparent hover:underline"
            onClick={onReset}
          >
            Reset to auto
          </Button>
        ) : null}
      </div>

      <div className="relative min-w-0">
        {children}

        {state === "valid" && (
          <Check
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-3 h-4 w-4 text-emerald-600",
              multiline ? "top-3" : "top-1/2 -translate-y-1/2",
            )}
          />
        )}
        {state === "invalid" && (
          <X
            aria-hidden
            className={cn(
              "pointer-events-none absolute right-3 h-4 w-4 text-red-500",
              multiline ? "top-3" : "top-1/2 -translate-y-1/2",
            )}
          />
        )}
      </div>

      <div className="mt-1 min-h-[1.25rem]">
        {state === "invalid" && errorMessage ? (
          <p role="alert" className="text-sm text-red-500">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function fieldControlClass(
  state: FieldVisualState,
  extra?: string,
) {
  return cn(
    "w-full min-w-0 max-w-full",
    extra,
  );
}
