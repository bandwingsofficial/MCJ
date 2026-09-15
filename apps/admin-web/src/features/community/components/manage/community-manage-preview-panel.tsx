"use client";

import { CommunityPostPreview } from "@/src/features/community/components/community-post-preview";

import type { CommunityPostDetails } from "@/src/features/community/types/community.types";

interface Props {
  post: CommunityPostDetails;
}

export function CommunityManagePreviewPanel({ post }: Props) {
  return (
    <div className="flex justify-center py-4">
      <CommunityPostPreview
        type={post.type}
        caption={post.caption ?? ""}
        mediaUrl={post.mediaUrl}
        hashtags={post.hashtags}
        location={post.location ?? undefined}
      />
    </div>
  );
}
