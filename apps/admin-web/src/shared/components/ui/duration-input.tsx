"use client";

import { Input } from "@/src/shared/components/ui/input";
import {
  FieldVisualState,
  validatedFieldInputClass,
} from "@/src/shared/components/ui/validated-field";
import { normalizeDurationHmsInput } from "@/src/shared/utils/duration";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  state?: FieldVisualState;
  placeholder?: string;
}

export function DurationInput({
  value,
  onChange,
  onBlur,
  disabled = false,
  state = "neutral",
  placeholder = "00:00:00",
}: Props) {
  return (
    <Input
      value={value}
      placeholder={placeholder}
      inputMode="numeric"
      maxLength={8}
      disabled={disabled}
      className={validatedFieldInputClass(state)}
      onChange={(event) => {
        const raw = event.target.value;
        if (/^\d{0,2}(:\d{0,2}(:\d{0,2})?)?$/.test(raw) || raw === "") {
          onChange(raw);
        }
      }}
      onBlur={() => {
        if (value.trim()) {
          onChange(normalizeDurationHmsInput(value));
        }
        onBlur?.();
      }}
    />
  );
}
