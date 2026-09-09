"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { BatchMode } from "@/src/features/branch-ops/utils/batch-mode.utils";

interface Props {
  mode: BatchMode | string;
}

export function BatchModeBadge({ mode }: Props) {
  switch (mode) {
    case "ONLINE":
      return <Badge variant="success">Online</Badge>;
    case "OFFLINE":
      return <Badge variant="warning">Offline / Classroom</Badge>;
    case "RECORDED":
      return <Badge variant="info">Self-Paced / Pre-Recorded</Badge>;
    default:
      return <Badge>{mode}</Badge>;
  }
}
