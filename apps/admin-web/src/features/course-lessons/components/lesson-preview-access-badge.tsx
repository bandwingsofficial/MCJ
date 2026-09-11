"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { cn } from "@/src/shared/lib/cn";

interface Props {
  isPreview: boolean;
}

const compactClass =
  "inline-flex items-center rounded-full px-2 py-0 text-[11px] font-semibold leading-5";

export function LessonPreviewAccessBadge({ isPreview }: Props) {
  if (isPreview) {
    return (
      <Badge variant="success" className={compactClass}>
        Unlocked
      </Badge>
    );
  }

  return (
    <span
      className={cn(
        compactClass,
        "border border-[#C7D9F5] bg-[#EFF4FA] text-[#526581] ring-1 ring-[#DCE8F5]/80",
      )}
    >
      Locked
    </span>
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
