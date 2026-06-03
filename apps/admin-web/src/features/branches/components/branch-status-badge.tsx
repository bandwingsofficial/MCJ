"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import { BranchStatus } from "@/src/features/branches/types/branch.types";

interface BranchStatusBadgeProps {
  status: BranchStatus;
}

export function BranchStatusBadge({
  status,
}: BranchStatusBadgeProps) {
  if (status === "ACTIVE") {
    return (
      <Badge variant="success">
        Active
      </Badge>
    );
  }

  return (
    <Badge variant="danger">
      Inactive
    </Badge>
  );
}