"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import {
  getBatchDisplayStatus,
} from "@/src/features/branch-ops/utils/batch-display";

interface Props {
  status?: string | null;
  isActive?: boolean;
  isDeleted?: boolean;
  deletedAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
}

const compactBadgeClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function BatchStatusBadge({
  status,
  isActive = true,
  isDeleted,
  deletedAt,
  startDate,
  endDate,
}: Props) {
  const display = getBatchDisplayStatus({
    status,
    isActive,
    isDeleted,
    deletedAt,
    startDate,
    endDate,
  });

  return (
    <Badge variant={display.variant} className={compactBadgeClass}>
      {display.label}
    </Badge>
  );
}
