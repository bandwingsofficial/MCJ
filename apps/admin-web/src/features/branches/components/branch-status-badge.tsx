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
  if (deletedAt) {
    return (
      <Badge
        variant="danger"
        className="px-2.5 py-0.5 text-sm"
      >
        Archived
      </Badge>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Badge
        variant="success"
        className="px-2.5 py-0.5 text-sm"
      >
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="danger"
      className="px-2.5 py-0.5 text-sm"
    >
      Inactive
    </Badge>
  );
}
