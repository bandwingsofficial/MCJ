"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type {
  CommunityPostStatus,
} from "@/src/features/community/types/community.types";

interface CommunityStatusBadgeProps {
  status: CommunityPostStatus;
}

export function CommunityStatusBadge({
  status,
}: CommunityStatusBadgeProps) {
  const variant =
    status === "PUBLISHED"
      ? "success"
      : status === "DRAFT"
        ? "warning"
        : "default";

  return (
    <Badge variant={variant}>
      {status}
    </Badge>
  );
}