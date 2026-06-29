"use client";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

interface CommunityHashtagInputProps {
  value: string[];

  onChange: (hashtags: string[]) => void;
}

export function CommunityHashtagInput({
  value,
  onChange,
}: CommunityHashtagInputProps) {
  return (
    <div className="space-y-2">
      <Label>
        Hashtags
      </Label>

      <Input
        placeholder="placement, success"
        value={value.join(", ")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean),
          )
        }
      />
    </div>
  );
}