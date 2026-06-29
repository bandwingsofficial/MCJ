"use client";

import type {
  CommunityPost,
} from "@/src/features/community/types/community.types";

interface CommunityMediaPreviewProps {
  post: CommunityPost;
}

export function CommunityMediaPreview({
  post,
}: CommunityMediaPreviewProps) {
  if (!post.mediaUrl) {
    return null;
  }

  if (post.type === "VIDEO") {
    return (
      <video
        controls
        className="w-full rounded-lg border"
      >
        <source
          src={post.mediaUrl}
        />
      </video>
    );
  }

  return (
    <img
      src={post.mediaUrl}
      alt={post.caption}
      className="w-full rounded-lg border object-cover"
    />
  );
}