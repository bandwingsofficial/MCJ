"use client";

import { Card } from "@/src/shared/components/ui/card";

import type {
  CommunityPost,
} from "@/src/features/community/types/community.types";

interface CommunityStatisticsProps {
  post: CommunityPost;
}

export function CommunityStatistics({
  post,
}: CommunityStatisticsProps) {
  return (
    <Card className="grid grid-cols-2 gap-4 p-6 md:grid-cols-4">
      <div>
        <p className="text-sm text-muted-foreground">
          Views
        </p>

        <p className="text-2xl font-semibold">
          {post.viewCount}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          Likes
        </p>

        <p className="text-2xl font-semibold">
          {post.likeCount}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          Comments
        </p>

        <p className="text-2xl font-semibold">
          {post.commentCount}
        </p>
      </div>

      <div>
        <p className="text-sm text-muted-foreground">
          Shares
        </p>

        <p className="text-2xl font-semibold">
          {post.shareCount}
        </p>
      </div>
    </Card>
  );
}