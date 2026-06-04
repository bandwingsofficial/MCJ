"use client";

import { Badge } from "@/src/shared/components/ui/badge";

interface Props {
  isActive: boolean;
}

export const BranchUserStatusBadge = ({
  isActive,
}: Props) => {
  if (isActive) {
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
};