"use client";

import { PageHeader } from "@/src/shared/components/ui/page-header";

import {
  CommunityStatusBadge,
} from "./CommunityStatusBadge";
import {
  CommunityTypeBadge,
} from "./CommunityTypeBadge";

import type {
  CommunityPost,
} from "@/src/features/community/types/community.types";

interface CommunityDetailHeaderProps {
  post: CommunityPost;
}

export function CommunityDetailHeader({
  post,
}: CommunityDetailHeaderProps) {
  return (
    <PageHeader
      title="Community Post"
      description={post.caption}
      actions={
        <div className="flex items-center gap-2">
          <CommunityTypeBadge
            type={post.type}
          />

          <CommunityStatusBadge
            status={post.status}
          />
        </div>
      }
    />
  );
}