"use client";

import { cn } from "@/src/shared/lib/cn";
import { countWords } from "@/src/shared/utils/word-count";

interface Props {
  value: string;
  maxWords: number;
  className?: string;
}

export function WordCount({ value, maxWords, className }: Props) {
  const wordCount = countWords(value);
  const isOverLimit = wordCount > maxWords;

  return (
    <p
      className={cn(
        "mt-1 text-right text-xs tabular-nums",
        isOverLimit ? "text-red-600" : "text-slate-500",
        className,
      )}
    >
      {Math.min(wordCount, maxWords)}/{maxWords} words
    </p>
  );
}
