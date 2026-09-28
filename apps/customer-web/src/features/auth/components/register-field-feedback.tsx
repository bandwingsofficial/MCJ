"use client";

import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import { FormError } from "@/src/shared/components/ui/form-error";
import { cn } from "@/src/shared/lib/cn";

type AsyncFieldState = "idle" | "checking" | "success" | "error";

interface RegisterFieldFeedbackProps {
  schemaMessage?: string;
  asyncState?: AsyncFieldState;
  asyncMessage?: string;
}

export function RegisterFieldFeedback({
  schemaMessage,
  asyncState = "idle",
  asyncMessage,
}: RegisterFieldFeedbackProps) {
  if (schemaMessage) {
    return <FormError message={schemaMessage} />;
  }

  if (asyncState === "checking") {
    return (
      <p className="mt-1.5 flex items-center gap-1.5 text-sm text-stone-500">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
        Checking…
      </p>
    );
  }

  if (asyncState === "success" && asyncMessage) {
    return (
      <p
        role="status"
        className="mt-1.5 flex items-center gap-1.5 text-sm text-emerald-600"
      >
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {asyncMessage}
      </p>
    );
  }

  if (asyncState === "error" && asyncMessage) {
    return (
      <p
        role="alert"
        className="mt-1.5 flex items-center gap-1.5 text-sm text-red-500"
      >
        <XCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
        {asyncMessage}
      </p>
    );
  }

  return null;
}

export function registerInputStatusClass(
  asyncState: AsyncFieldState,
  hasSchemaError: boolean,
): string {
  if (hasSchemaError || asyncState === "error") {
    return "mcj-input-status-error";
  }
  if (asyncState === "success") {
    return "mcj-input-status-success";
  }
  return "";
}

export function RegisterInputIcon({
  asyncState,
  hasSchemaError,
}: {
  asyncState: AsyncFieldState;
  hasSchemaError: boolean;
}) {
  if (hasSchemaError || asyncState === "error") {
    return (
      <XCircle
        className={cn("mcj-field-status-icon text-red-500")}
        aria-hidden
      />
    );
  }
  if (asyncState === "success") {
    return (
      <CheckCircle2
        className={cn("mcj-field-status-icon text-emerald-600")}
        aria-hidden
      />
    );
  }
  if (asyncState === "checking") {
    return (
      <Loader2
        className={cn("mcj-field-status-icon animate-spin text-stone-400")}
        aria-hidden
      />
    );
  }
  return null;
}
