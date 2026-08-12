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
  triggerClassName?: string;
  onValueChange: (value: string) => void;
}

export function AppSelect({
  value,
  options,
  placeholder = "Select option",
  disabled,
  triggerClassName,
  onValueChange,
}: AppSelectProps) {
  return (
    <SelectPrimitive.Root
      value={value}
      disabled={disabled}
      onValueChange={onValueChange}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-11 w-full items-center justify-between rounded-xl border border-slate-300 bg-white px-4 text-sm",
          "focus:outline-none focus:ring-2 focus:ring-[#2447A8]",
          triggerClassName
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder} />

        <ChevronDown className="h-4 w-4" />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          className="z-50 min-w-[200px] overflow-hidden rounded-xl border bg-white shadow-lg"
        >
          <SelectPrimitive.Viewport className="p-1">
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className="relative flex cursor-pointer items-center rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100"
              >
                <SelectPrimitive.ItemText>
                  {option.label}
                </SelectPrimitive.ItemText>

                <SelectPrimitive.ItemIndicator className="absolute right-3">
                  <Check className="h-4 w-4" />
                </SelectPrimitive.ItemIndicator>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}