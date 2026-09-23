"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { cn } from "@/src/shared/lib/cn";

interface CommunityHashtagInputProps {
  value: string[];
  disabled?: boolean;
  error?: string | null;
  onChange: (hashtags: string[]) => void;
}

const HASHTAG_PATTERN = /^[a-zA-Z0-9_]+$/;

function normalizeHashtag(raw: string): string | null {
  const normalized = raw.trim().replace(/^#+/, "").toLowerCase();
  if (!normalized) {
    return null;
  }

  if (!HASHTAG_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

export function CommunityHashtagInput({
  value,
  disabled = false,
  error,
  onChange,
}: CommunityHashtagInputProps) {
  const [draft, setDraft] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

  const addHashtag = (raw: string) => {
    const normalized = normalizeHashtag(raw);
    if (!normalized) {
      if (raw.trim()) {
        setDraftError(
          "Use letters, numbers, or underscores only (no spaces).",
        );
      }
      return;
    }

    if (value.some((tag) => tag.toLowerCase() === normalized)) {
      setDraft("");
      setDraftError(null);
      return;
    }

    onChange([...value, normalized]);
    setDraft("");
    setDraftError(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addHashtag(draft);
    }

    if (event.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  };

  const displayError = error ?? draftError;

  return (
    <div className="w-full space-y-2">
      <Label>Hashtags</Label>

      <div
        className={cn(
          "flex min-h-[46px] w-full flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2 py-1.5",
          displayError ? "border-red-400" : "border-[#DCE8F5]",
          disabled && "opacity-60",
        )}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 rounded-lg bg-[#E8F1FF] px-2 py-1 text-xs font-medium text-[#1E3A8A]"
          >
            #{tag}
            <button
              type="button"
              disabled={disabled}
              className="rounded text-[#647A9B] hover:text-red-500"
              aria-label={`Remove hashtag ${tag}`}
              onClick={() => onChange(value.filter((item) => item !== tag))}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          disabled={disabled}
          placeholder={
            value.length === 0
              ? "Type a word and press Enter"
              : "Add another hashtag"
          }
          className="h-8 min-w-[160px] flex-1 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
          onBlur={() => {
            if (draft.trim()) {
              addHashtag(draft);
            }
          }}
          onChange={(event) => {
            setDraft(event.target.value);
            if (draftError) {
              setDraftError(null);
            }
          }}
          onKeyDown={handleKeyDown}
        />
      </div>

      {displayError ? (
        <p role="alert" className="text-sm text-red-500">
          {displayError}
        </p>
      ) : (
        <p className="text-xs text-[#647A9B]">
          Press Enter after each hashtag. The # is added automatically.
        </p>
      )}
    </div>
  );
}
