"use client";

import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { Check, ChevronDown } from "lucide-react";

import { cn } from "@/src/shared/lib/cn";

export interface SelectOption {
  label: string;
  value: string;
}

interface AppSelectProps {
  value?: string;
  placeholder?: string;
  options: SelectOption[];
  disabled?: boolean;
  onValueChange: (value: string) => void;
  className?: string;
}

export function AppSelect({
  value,
  options,
  placeholder = "Select option",
  disabled,
  onValueChange,
  className,
}: AppSelectProps) {
  return (
    <SelectPrimitive.Root
      value={value || undefined}
      disabled={disabled}
      onValueChange={onValueChange}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-medium text-[#0B1F3A]",
          "shadow-sm outline-none transition",
          "hover:border-slate-300",
          "focus:border-[#2563D9] focus:ring-2 focus:ring-[#2563D9]/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[placeholder]:font-normal data-[placeholder]:text-slate-400",
          className,
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          sideOffset={6}
          className={cn(
            "z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_12px_40px_-16px_rgba(11,31,58,0.35)]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
          )}
        >
          <SelectPrimitive.Viewport className="p-1.5">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={cn(
                  "relative flex cursor-pointer items-center rounded-lg py-2.5 pl-3 pr-10 text-sm text-[#0B1F3A] outline-none",
                  "data-[highlighted]:bg-[#F3F7FF] data-[highlighted]:text-[#0B1F3A]",
                  "data-[state=checked]:bg-[#EAF1FF] data-[state=checked]:font-semibold",
                )}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                <SelectPrimitive.ItemIndicator className="absolute right-3 flex items-center">
                  <Check className="h-4 w-4 text-[#2563D9]" strokeWidth={2.5} />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
