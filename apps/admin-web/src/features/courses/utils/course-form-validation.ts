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

export const COURSE_WORD_LIMITS = {
  shortDescription: 50,
  description: 150,
} as const;

export const COURSE_CHAR_LIMITS = {
  title: 160,
  tagline: 220,
} as const;

export const COURSE_IMAGE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const COURSE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export function validateCourseImageFile(file: File): string | null {
  if (
    !COURSE_IMAGE_ACCEPT.includes(
      file.type as (typeof COURSE_IMAGE_ACCEPT)[number],
    )
  ) {
    return "Please upload a valid image.";
  }

  if (file.size > COURSE_IMAGE_MAX_BYTES) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}

export function getWordCountState(
  touched: boolean,
  error?: string,
  value?: string,
  maxWords?: number,
): FieldVisualState {
  if (!touched) {
    return "neutral";
  }
  if (error) {
    return "invalid";
  }
  if (!value?.trim()) {
    return "neutral";
  }
  if (maxWords && countWords(value) > maxWords) {
    return "invalid";
  }
  return "valid";
}
