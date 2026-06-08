"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

interface CheckboxProps {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Checkbox({
  checked,
  disabled,
  onCheckedChange,
}: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={(value) =>
        onCheckedChange(Boolean(value))
      }
      className="flex h-5 w-5 items-center justify-center rounded border border-slate-300 bg-white data-[state=checked]:border-[#2447A8] data-[state=checked]:bg-[#2447A8]"
    >
      <CheckboxPrimitive.Indicator>
        <Check className="h-4 w-4 text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}