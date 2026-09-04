"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { BatchMode } from "@/src/features/batches/types/batch.types";

interface BatchModeBadgeProps {
  mode: BatchMode;
}

export function BatchModeBadge({ mode }: BatchModeBadgeProps) {
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
