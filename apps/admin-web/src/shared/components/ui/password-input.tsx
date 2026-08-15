"use client";

import {
  forwardRef,
  useState,
} from "react";

import { Eye, EyeOff } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

import { Input, type InputProps } from "@/src/shared/components/ui/input";

export interface PasswordInputProps
  extends Omit<InputProps, "type"> {}

export const PasswordInput = forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const [visible, setVisible] =
      useState(false);

    return (
      <div className="relative">
        <Input
          ref={ref}
          type={
            visible
              ? "text"
              : "password"
          }
          disabled={disabled}
          className={className}
          {...props}
        />

        <button
          type="button"
          disabled={disabled}
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
          title={
            visible
              ? "Hide password"
              : "Show password"
          }
          className={cn(
            "absolute right-1 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-500",
            "hover:bg-slate-100 hover:text-slate-700",
            "disabled:pointer-events-none disabled:opacity-50"
          )}
          onClick={() => {
            setVisible(
              (current) => !current
            );
          }}
        >
          {visible ? (
            <EyeOff
              className="h-4 w-4"
              aria-hidden
            />
          ) : (
            <Eye
              className="h-4 w-4"
              aria-hidden
            />
          )}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName =
  "PasswordInput";
