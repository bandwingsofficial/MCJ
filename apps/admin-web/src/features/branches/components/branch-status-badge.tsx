"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import { BranchStatus } from "@/src/features/branches/types/branch.types";

interface BranchStatusBadgeProps {
  status: BranchStatus;
  deletedAt?: string | null;
}

export function BranchStatusBadge({
  status,
  deletedAt,
}: BranchStatusBadgeProps) {
  const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

  if (deletedAt) {
    return (
      <Badge variant="danger" className={compactClass}>
        Archived
      </Badge>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Badge variant="success" className={compactClass}>
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="danger" className={compactClass}>
      Inactive
    </Badge>
  );
}
