"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import {
  formatBatchStatus,
  statusBadgeVariant,
} from "@/src/features/branch-ops/utils/batch-display";

interface Props {
  status?: string | null;
  isActive?: boolean;
}

export function BatchStatusBadge({ status, isActive = true }: Props) {
  const resolvedStatus =
    !isActive && status !== "ARCHIVED" && status !== "CANCELLED"
      ? "INACTIVE"
      : status;

  return (
    <Badge variant={statusBadgeVariant(resolvedStatus)}>
      {formatBatchStatus(resolvedStatus)}
    </Badge>
  );
}
