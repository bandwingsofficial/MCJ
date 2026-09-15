"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import {
  CommunityStatusBadge,
} from "./CommunityStatusBadge";
import {
  CommunityTypeBadge,
} from "./CommunityTypeBadge";

import type { CommunityPost } from "@/src/features/community/types/community.types";
import { getCommunityManagementStatus } from "@/src/features/community/utils/community-display.utils";

interface CommunityDetailHeaderProps {
  post: CommunityPost;
}

export function CommunityDetailHeader({
  post,
}: CommunityDetailHeaderProps) {
  return (
    <PageHeader
      title="Community Post"
      description={post.caption ?? undefined}
      actions={
        <div className="flex items-center gap-2">
          <CommunityTypeBadge
            type={post.type}
          />

          <CommunityStatusBadge
            status={getCommunityManagementStatus(post)}
          />
        </div>
      }
    />
  );
}