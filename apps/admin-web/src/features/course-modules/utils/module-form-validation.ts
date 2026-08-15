import type { FieldVisualState } from "@/src/shared/components/ui/validated-field";
import {
  countWords,
  isWithinWordLimit,
} from "@/src/shared/utils/word-count";

export function getSyncFieldState(
  touched: boolean,
  error?: string,
  value?: string,
  options?: { required?: boolean },
): FieldVisualState {
  if (!touched) {
    return "neutral";
  }
  if (error) {
    return "invalid";
  }
  if (options?.required) {
    return value?.trim() ? "valid" : "neutral";
  }
  if (value?.trim()) {
    return "valid";
  }
  return "neutral";
}

export function wordLimitRefine(maxWords: number) {
  return (value: string) => isWithinWordLimit(value, maxWords);
}

export function requiredWordsRefine(minWords = 1) {
  return (value: string) => countWords(value) >= minWords;
}

export const MODULE_WORD_LIMITS = {
  moduleDescription: 150,
  lessonDescription: 10,
  videoTitle: 50,
  videoDescription: 150,
} as const;

export type LessonContentType =
  | "LESSON"
  | "SELF_PACED_VIDEO"
  | "LIVE_RECORDED_VIDEO";
