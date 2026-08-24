"use client";

import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  isPreview: boolean;
}

export function LessonPreviewAccessBadge({ isPreview }: Props) {
  return (
    <Badge
      variant={isPreview ? "success" : "default"}
      className="gap-1 px-2.5 py-0.5 text-sm font-normal"
    >
      <span aria-hidden>{isPreview ? "🔓" : "🔒"}</span>
      {isPreview ? "Unlocked" : "Locked"}
    </Badge>
  );
}

export function matchesPreviewAccessFilter(
  isPreview: boolean,
  status: string,
) {
  if (status === "ALL") {
    return true;
  }
  if (status === "UNLOCKED") {
    return isPreview;
  }
  if (status === "LOCKED") {
    return !isPreview;
  }
  return true;
}

export const LESSON_PREVIEW_FILTER_OPTIONS = [
  { label: "All Preview Access", value: "ALL" },
  { label: "Unlocked", value: "UNLOCKED" },
  { label: "Locked", value: "LOCKED" },
];
