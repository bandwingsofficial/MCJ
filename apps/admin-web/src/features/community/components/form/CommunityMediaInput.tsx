"use client";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { FormError } from "@/src/shared/components/ui/form-error";

interface CommunityMediaInputProps {
  value: string;

  onChange: (value: string) => void;

  error?: string;
}

export function CommunityMediaInput({
  value,
  onChange,
  error,
}: CommunityMediaInputProps) {
  return (
    <div className="space-y-2">
      <Label required>
        Media URL
      </Label>

      <Input
        value={value}
        placeholder="https://example.com/image.jpg"
        onChange={(event) =>
          onChange(event.target.value)
        }
      />

      <FormError message={error} />
    </div>
  );
}