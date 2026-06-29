"use client";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";

interface CommunityMentionInputProps {
  value: string[];

  onChange: (mentions: string[]) => void;
}

export function CommunityMentionInput({
  value,
  onChange,
}: CommunityMentionInputProps) {
  return (
    <div className="space-y-2">
      <Label>
        Mentions
      </Label>

      <Input
        placeholder="@john, @admin"
        value={value.join(", ")}
        onChange={(event) =>
          onChange(
            event.target.value
              .split(",")
              .map((mention) =>
                mention.trim(),
              )
              .filter(Boolean),
          )
        }
      />
    </div>
  );
}