"use client";

import type { ReactNode } from "react";
import { Check, X, type LucideIcon } from "lucide-react";

import { Label } from "@/src/shared/components/ui/label";
import { cn } from "@/src/shared/lib/cn";

export type FieldVisualState =
  | "neutral"
  | "valid"
  | "invalid"
  | "checking";

export interface ValidatedFieldInputClassOptions {
  passwordToggle?: boolean;
  leftIcon?: boolean;
  select?: boolean;
  /** Decorative icon on the right (validation sits further inward). */
  rightDecorIcon?: boolean;
  /** Extra right padding for textarea counters or similar. */
  textarea?: boolean;
}

interface ValidatedFieldProps {
  label: string;
  required?: boolean;
  state: FieldVisualState;
  errorMessage?: string | null;
  successMessage?: string | null;
  checkingMessage?: string;
  passwordToggle?: boolean;
  select?: boolean;
  textarea?: boolean;
  leftIcon?: ReactNode;
  rightDecorIcon?: LucideIcon;
  rightDecorAlignTop?: boolean;
  className?: string;
  htmlId?: string;
  children: ReactNode;
}

function validationIconRightClass(
  options?: ValidatedFieldInputClassOptions,
): string {
  if (options?.passwordToggle || options?.select) {
    return "right-9";
  }

  return "right-3";
}

function inputPaddingRightClass(
  options?: ValidatedFieldInputClassOptions,
): string {
  if (options?.passwordToggle || options?.select) {
    return "pr-16";
  }

  if (options?.rightDecorIcon || options?.textarea) {
    return "pr-16";
  }

  if (options?.leftIcon) {
    return "pr-10";
  }

  return "pr-10";
}

export function validatedFieldInputClass(
  state: FieldVisualState,
  extra?: string,
  options?: ValidatedFieldInputClassOptions,
) {
  const paddingOptions: ValidatedFieldInputClassOptions = {
    ...options,
    rightDecorIcon: options?.rightDecorIcon,
  };

  return cn(
    options?.leftIcon && "pl-10",
    inputPaddingRightClass(paddingOptions),
    "transition-[border-color,box-shadow] duration-150",
    state === "valid" &&
      "border-emerald-400 focus:ring-emerald-500/25",
    state === "invalid" &&
      "border-red-300 shadow-[0_0_0_3px_rgba(254,202,202,0.45)] focus:ring-red-300/30",
    extra,
  );
}

function DecorIcon({
  icon: Icon,
  alignTop,
}: {
  icon: LucideIcon;
  alignTop?: boolean;
}) {
  return (
    <Icon
      className={cn(
        "pointer-events-none absolute right-9 z-[1] h-4 w-4 text-slate-400",
        alignTop ? "top-3" : "top-1/2 -translate-y-1/2",
      )}
      aria-hidden="true"
    />
  );
}

export function ValidatedField({
  label,
  required = false,
  state,
  errorMessage,
  successMessage,
  checkingMessage = "Checking...",
  passwordToggle = false,
  select = false,
  textarea = false,
  leftIcon,
  rightDecorIcon,
  rightDecorAlignTop,
  className,
  htmlId,
  children,
}: ValidatedFieldProps) {
  const classOptions: ValidatedFieldInputClassOptions = {
    passwordToggle,
    leftIcon: Boolean(leftIcon),
    select,
    rightDecorIcon: Boolean(rightDecorIcon),
    textarea,
  };

  const validationIconClass = validationIconRightClass(classOptions);
  const validationVerticalClass = textarea
    ? "top-3 -translate-y-0"
    : "top-1/2 -translate-y-1/2";

  return (
    <div id={htmlId} className={cn("min-w-0", className)}>
      <Label required={required}>{label}</Label>

      <div className="relative w-full min-w-0">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 z-[1] -translate-y-1/2 text-[#8AA0BB]">
            {leftIcon}
          </span>
        ) : null}

        {children}

        {rightDecorIcon ? (
          <DecorIcon
            icon={rightDecorIcon}
            alignTop={rightDecorAlignTop ?? textarea}
          />
        ) : null}

        {state === "valid" ? (
          <Check
            aria-hidden
            className={cn(
              "pointer-events-none absolute z-[2] h-4 w-4 text-emerald-600",
              validationVerticalClass,
              validationIconClass,
            )}
          />
        ) : null}
        {state === "invalid" ? (
          <X
            aria-hidden
            className={cn(
              "pointer-events-none absolute z-[2] h-4 w-4 text-red-500",
              validationVerticalClass,
              validationIconClass,
            )}
          />
        ) : null}
      </div>

      <div className="mt-1 min-h-[1.25rem]">
        {state === "checking" ? (
          <p className="text-xs text-slate-500">{checkingMessage}</p>
        ) : state === "valid" && successMessage ? (
          <p className="text-xs text-emerald-600">{successMessage}</p>
        ) : state === "invalid" && errorMessage ? (
          <p role="alert" className="text-sm text-red-500">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </div>
  );
}

/** Field with a decorative Lucide icon; uses left icon on selects to avoid chevron overlap. */
export function IconValidatedField({
  icon: Icon,
  select,
  leftIcon,
  children,
  ...props
}: Omit<ValidatedFieldProps, "leftIcon" | "rightDecorIcon" | "select"> & {
  icon: LucideIcon;
  select?: boolean;
  leftIcon?: ReactNode;
}) {
  const decorOnLeft = Boolean(select);

  return (
    <ValidatedField
      {...props}
      select={select}
      leftIcon={
        leftIcon ??
        (decorOnLeft ? (
          <Icon className="h-4 w-4" aria-hidden />
        ) : undefined)
      }
      rightDecorIcon={decorOnLeft ? undefined : Icon}
    >
      {children}
    </ValidatedField>
  );
}

export function iconDecorInputClass(
  state: FieldVisualState,
  extra?: string,
  options?: Omit<ValidatedFieldInputClassOptions, "rightDecorIcon"> & {
    decor?: boolean;
  },
) {
  return validatedFieldInputClass(state, extra, {
    ...options,
    rightDecorIcon: options?.decor ?? true,
  });
}
