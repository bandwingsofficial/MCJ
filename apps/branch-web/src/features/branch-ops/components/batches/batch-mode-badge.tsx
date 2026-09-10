"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { BatchMode } from "@/src/features/branch-ops/utils/batch-mode.utils";

interface Props {
  mode: BatchMode | string;
}

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function BatchModeBadge({ mode }: Props) {
  switch (mode) {
    case "ONLINE":
      return (
        <Badge variant="success" className={compactBadgeClass}>
          Online
        </Badge>
      );
    case "OFFLINE":
      return (
        <Badge variant="warning" className={compactBadgeClass}>
          Offline / Classroom
        </Badge>
      );
    case "RECORDED":
      return (
        <Badge variant="info" className={compactBadgeClass}>
          Self-Paced / Pre-Recorded
        </Badge>
      );
    default:
      return <Badge className={compactBadgeClass}>{mode}</Badge>;
  }
}
