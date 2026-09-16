"use client";

import { CommunityPostPreview } from "@/src/features/community/components/community-post-preview";

import type { CommunityPostDetails } from "@/src/features/community/types/community.types";
import { mapExistingPostMediaToFormItems } from "@/src/features/community/utils/community-media.utils";

interface Props {
  post: CommunityPostDetails;
}

export function CommunityManagePreviewPanel({ post }: Props) {
  return (
    <div className="flex justify-center py-4">
      <CommunityPostPreview
        type={post.type}
        caption={post.caption ?? ""}
        authorName={post.authorName}
        mediaItems={mapExistingPostMediaToFormItems(post)}
        hashtags={post.hashtags}
        location={post.location ?? undefined}
      />
    </div>
  );
}
