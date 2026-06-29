"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type {
  CommunityPostType,
} from "@/src/features/community/types/community.types";

interface CommunityTypeBadgeProps {
  type: CommunityPostType;
}

export function CommunityTypeBadge({
  type,
}: CommunityTypeBadgeProps) {
  return (
    <Badge variant="info">
      {type}
    </Badge>
  );
}