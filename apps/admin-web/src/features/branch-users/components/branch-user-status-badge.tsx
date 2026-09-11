"use client";

import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  isActive: boolean;
  isDeleted?: boolean;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function BranchUserStatusBadge({
  isActive,
  isDeleted = false,
}: Props) {
  if (isDeleted) {
    return (
      <Badge variant="danger" className={compactClass}>
        Deleted
      </Badge>
    );
  }

  if (isActive) {
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
