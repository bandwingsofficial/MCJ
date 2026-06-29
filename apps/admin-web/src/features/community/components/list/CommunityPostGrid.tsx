"use client";

import type {
  CommunityPost,
} from "@/src/features/community/types/community.types";

import { CommunityEmpty } from "./CommunityEmpty";
import { CommunityPostCard } from "./CommunityPostCard";

interface CommunityPostGridProps {
  posts: CommunityPost[];

  onPostClick?: (
    post: CommunityPost,
  ) => void;
}

export function CommunityPostGrid({
  posts,
  onPostClick,
}: CommunityPostGridProps) {
  if (!posts.length) {
    return <CommunityEmpty />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
      {posts.map((post) => (
        <CommunityPostCard
          key={post.id}
          post={post}
          onClick={onPostClick}
        />
      ))}
    </div>
  );
}