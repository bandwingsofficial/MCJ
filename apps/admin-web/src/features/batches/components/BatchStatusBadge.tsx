"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { BatchStatus } from "@/src/features/batches/types/batch.types";
import {
  getBatchDisplayStatus,
  type BatchDisplayStatus,
} from "@/src/features/batches/utils/batch-select.utils";

interface Props {
  isActive?: boolean;
  status?: BatchStatus;
  isDeleted?: boolean;
  startDate?: string | null;
  endDate?: string | null;
  /** When provided, skips recompute (e.g. from parent). */
  displayStatus?: BatchDisplayStatus;
}

export function BatchStatusBadge({
  isActive = true,
  status,
  isDeleted = false,
  startDate,
  endDate,
  displayStatus,
}: Props) {
  const resolved =
    displayStatus ??
    getBatchDisplayStatus({
      status: status ?? "ONGOING",
      startDate: startDate ?? new Date().toISOString(),
      endDate: endDate ?? null,
      isActive,
      isDeleted,
      deletedAt: isDeleted ? new Date().toISOString() : null,
    });

  return (
    <Badge variant={resolved.variant} className="px-2.5 py-0.5 text-sm">
      {resolved.label}
    </Badge>
  );
}
