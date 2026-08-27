"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

interface RadioOption {
  label: string;
  value: string;
}

interface RadioGroupProps {
  value: string;
  options: RadioOption[];
  onValueChange: (value: string) => void;
}

export function RadioGroup({
  value,
  options,
  onValueChange,
}: RadioGroupProps) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      className="flex flex-col gap-3"
    >
      {options.map((option) => (
        <label
          key={option.value}
          className="flex cursor-pointer items-center gap-3"
        >
          <RadioGroupPrimitive.Item
            value={option.value}
            className="h-5 w-5 rounded-full border border-[#DCE8F5] data-[state=checked]:border-[#2563EB]"
          >
            <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
              <div className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
            </RadioGroupPrimitive.Indicator>
          </RadioGroupPrimitive.Item>

          <span className="text-sm text-slate-700">
            {option.label}
          </span>
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
}