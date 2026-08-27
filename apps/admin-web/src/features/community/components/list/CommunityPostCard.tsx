"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import type {
  CommunityPost,
} from "@/src/features/community/types/community.types";

interface CommunityPostCardProps {
  post: CommunityPost;

  onClick?: (post: CommunityPost) => void;
}

export function CommunityPostCard({
  post,
  onClick,
}: CommunityPostCardProps) {
  return (
    <div
      className="cursor-pointer"
      onClick={() => onClick?.(post)}
    >
      <Card
        className="overflow-hidden transition-shadow hover:shadow-[0_2px_10px_rgba(16,42,86,0.08)]"
      >
        {post.mediaUrl && (
          <img
            src={post.mediaUrl}
            alt={post.caption}
            className="h-56 w-full object-cover"
          />
        )}

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <Badge
              variant={
                post.status === "PUBLISHED"
                  ? "success"
                  : post.status === "DRAFT"
                    ? "warning"
                    : "default"
              }
            >
              {post.status}
            </Badge>

            <Badge variant="info">
              {post.type}
            </Badge>
          </div>

          <p className="line-clamp-3 text-sm">
            {post.caption}
          </p>

          <div className="grid grid-cols-4 gap-2 border-t pt-3 text-center text-xs">
            <div>
              <p className="font-semibold">
                {post.viewCount}
              </p>

              <p>Views</p>
            </div>

            <div>
              <p className="font-semibold">
                {post.likeCount}
              </p>

              <p>Likes</p>
            </div>

            <div>
              <p className="font-semibold">
                {post.commentCount}
              </p>

              <p>Comments</p>
            </div>

            <div>
              <p className="font-semibold">
                {post.shareCount}
              </p>

              <p>Shares</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}