"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { Input } from "@/src/shared/components/ui/input";
import { cn } from "@/src/shared/lib/cn";

interface JobTagInputProps {
  values: string[];
  disabled?: boolean;
  placeholder?: string;
  invalid?: boolean;
  onChange: (values: string[]) => void;
  onBlur?: () => void;
}

export function JobTagInput({
  values,
  disabled = false,
  placeholder = "Type and press Enter",
  invalid = false,
  onChange,
  onBlur,
}: JobTagInputProps) {
  const [draft, setDraft] = useState("");

  const addTag = (raw: string) => {
    const next = raw.trim();
    if (!next) {
      return;
    }

    if (values.some((value) => value.toLowerCase() === next.toLowerCase())) {
      setDraft("");
      return;
    }

    onChange([...values, next]);
    setDraft("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      addTag(draft);
    }

    if (event.key === "Backspace" && !draft && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border bg-white px-2 py-1.5",
        invalid ? "border-red-300" : "border-slate-300",
      )}
    >
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center gap-1 rounded-lg bg-[#E8F1FF] px-2 py-1 text-xs font-medium text-[#1E3A8A]"
        >
          {value}
          <button
            type="button"
            disabled={disabled}
            className="rounded text-[#647A9B] hover:text-red-500"
            onClick={() => onChange(values.filter((item) => item !== value))}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        value={draft}
        disabled={disabled}
        placeholder={values.length === 0 ? placeholder : "+ Add"}
        className="h-8 min-w-[140px] flex-1 border-0 px-1 shadow-none focus:ring-0"
        onBlur={() => {
          if (draft.trim()) {
            addTag(draft);
          }
          onBlur?.();
        }}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
}
