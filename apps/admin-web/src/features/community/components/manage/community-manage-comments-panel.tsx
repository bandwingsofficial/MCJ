"use client";

import { CommunityCommentList } from "@/src/features/community/components/details/CommunityCommentList";

import type { CommunityComment } from "@/src/features/community/types/community.types";

interface Props {
  comments: CommunityComment[];
}

export function CommunityManageCommentsPanel({ comments }: Props) {
  return (
    <div className="space-y-3">
      <p className="text-xs text-[#647A9B]">
        {comments.length} top-level comment{comments.length === 1 ? "" : "s"}{" "}
        loaded from post detail. Replies are shown inline.
      </p>
      <CommunityCommentList comments={comments} />
    </div>
  );
}
