"use client";

import * as SwitchPrimitive from "@radix-ui/react-switch";

interface SwitchProps {
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (checked: boolean) => void;
}

export function Switch({
  checked,
  disabled,
  onCheckedChange,
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      disabled={disabled}
      onCheckedChange={onCheckedChange}
      className="relative h-6 w-11 rounded-full bg-slate-300 data-[state=checked]:bg-[#2447A8]"
    >
      <SwitchPrimitive.Thumb className="block h-5 w-5 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-5" />
    </SwitchPrimitive.Root>
  );
}