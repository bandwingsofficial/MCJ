"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

import {
  ValidatedField,
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

export function leftIconInputClass(
  state: FieldVisualState,
  extra = "",
  options?: { textarea?: boolean },
) {
  return validatedFieldInputClass(
    state,
    cn("w-full min-w-0 max-w-full", extra),
    { leftIcon: true, textarea: options?.textarea },
  );
}

export function selectTriggerClass(state: FieldVisualState) {
  return validatedFieldInputClass(state, "w-full min-w-0 max-w-full", {
    leftIcon: true,
    select: true,
  });
}

export function LeftIconField({
  label,
  required,
  state,
  errorMessage,
  checkingMessage,
  successMessage,
  icon: Icon,
  textarea,
  select,
  children,
}: {
  label: string;
  required?: boolean;
  state: FieldVisualState;
  errorMessage?: string;
  checkingMessage?: string;
  successMessage?: string;
  icon: LucideIcon;
  textarea?: boolean;
  select?: boolean;
  children: ReactNode;
}) {
  return (
    <ValidatedField
      label={label}
      required={required}
      state={state}
      errorMessage={errorMessage}
      checkingMessage={checkingMessage}
      successMessage={successMessage}
      textarea={textarea}
      select={select}
      leftIcon={<Icon className="h-4 w-4" aria-hidden />}
    >
      {children}
    </ValidatedField>
  );
}
