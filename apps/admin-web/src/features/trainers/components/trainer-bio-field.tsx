"use client";

import type { FocusEvent } from "react";

import { Check, X } from "lucide-react";

import { Textarea } from "@/src/shared/components/ui/textarea";
import { Label } from "@/src/shared/components/ui/label";
import {
  validatedFieldInputClass,
  type FieldVisualState,
} from "@/src/shared/components/ui/validated-field";
import { cn } from "@/src/shared/lib/cn";

import {
  countWords,
  getBioWordCountClass,
  MAX_BIO_WORDS,
  truncateToMaxWords,
} from "@/src/features/trainers/utils/word-count.util";

interface TrainerBioFieldProps {
  value: string;
  state: FieldVisualState;
  errorMessage?: string;
  onChange: (value: string) => void;
  onBlur: (event: FocusEvent<HTMLTextAreaElement>) => void;
}

export function TrainerBioField({
  value,
  state,
  errorMessage,
  onChange,
  onBlur,
}: TrainerBioFieldProps) {
  const wordCount = countWords(value);

  return (
    <div className="min-w-0">
      <Label>Biography</Label>

      <div className="relative">
        <Textarea
          value={value}
          placeholder="Type trainer biography..."
          rows={4}
          className={validatedFieldInputClass(
            state,
            "min-h-[7rem] resize-y"
          )}
          onBlur={onBlur}
          onChange={(event) => {
            onChange(
              truncateToMaxWords(
                event.target.value,
                MAX_BIO_WORDS
              )
            );
          }}
        />

        {state === "valid" ? (
          <Check
            aria-hidden
            className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-emerald-600"
          />
        ) : null}

        {state === "invalid" ? (
          <X
            aria-hidden
            className="pointer-events-none absolute right-3 top-3 h-4 w-4 text-red-500"
          />
        ) : null}
      </div>

      <div className="mt-1 flex min-h-[1.25rem] items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          {state === "invalid" && errorMessage ? (
            <p role="alert" className="text-sm text-red-500">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <p
          className={cn(
            "shrink-0 text-xs tabular-nums",
            getBioWordCountClass(wordCount)
          )}
          aria-live="polite"
        >
          {wordCount}/{MAX_BIO_WORDS} words
        </p>
      </div>
    </div>
  );
}
