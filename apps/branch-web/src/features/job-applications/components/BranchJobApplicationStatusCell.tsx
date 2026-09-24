"use client";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import { Badge } from "@/src/shared/components/ui/badge";
import { useLifecycleNow } from "@/src/features/branch-interview-lifecycle/use-lifecycle-now";
import { resolveJobApplicationListPresentation } from "@/src/features/job-applications/utils/job-application-workflow.utils";

const compactClass = "max-w-full px-1.5 py-0 text-[11px] font-semibold leading-5";

interface Props {
  application: JobApplicationItem;
}

export function BranchJobApplicationStatusCell({ application }: Props) {
  const nowMs = useLifecycleNow();
  const presentation = resolveJobApplicationListPresentation(application, nowMs);

  if (presentation.statusDisplayMode === "plain") {
    const toneClass =
      presentation.statusVariant === "success"
        ? "text-emerald-700"
        : presentation.statusVariant === "danger"
          ? "text-red-600"
          : "text-[#102A56]";
    return (
      <span
        className={`block max-w-full text-[11px] font-semibold leading-snug break-words ${toneClass}`}
      >
        {presentation.statusLabel}
      </span>
    );
  }

  if (presentation.statusDisplayMode === "delay") {
    const isExpired = presentation.statusLabel === "Expired";
    const isWaitingDelay =
      presentation.statusLabel.toLowerCase().includes("delayed") ||
      presentation.statusLabel.toLowerCase().includes("waiting");
    const toneClass = isExpired || isWaitingDelay
      ? "text-red-600"
      : "text-[#102A56]";
    return (
      <span
        className={`block max-w-full text-[11px] font-semibold leading-snug break-words ${toneClass}`}
      >
        {presentation.statusLabel}
      </span>
    );
  }

  return (
    <Badge variant={presentation.statusVariant} className={compactClass}>
      {presentation.statusLabel}
    </Badge>
  );
}
