"use client";

import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  isActive: boolean;
  isDeleted?: boolean;
}

export function BranchUserStatusBadge({
  isActive,
  isDeleted = false,
}: Props) {
  if (isDeleted) {
    return (
      <Badge
        variant="danger"
        className="px-2.5 py-0.5 text-sm"
      >
        Deleted
      </Badge>
    );
  }

  if (isActive) {
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
      variant="warning"
      className="px-2.5 py-0.5 text-sm"
    >
      Inactive
    </Badge>
  );
}
