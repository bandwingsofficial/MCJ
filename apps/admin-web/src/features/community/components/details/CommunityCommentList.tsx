"use client";

import { EmptyState } from "@/src/shared/components/ui/empty-state";

import type {
  CommunityComment,
} from "@/src/features/community/types/community.types";

import { CommunityCommentItem } from "./CommunityCommentItem";

interface CommunityCommentListProps {
  comments: CommunityComment[];
}

export function CommunityCommentList({
  comments,
}: CommunityCommentListProps) {
  if (comments.length === 0) {
    return (
      <EmptyState
        title="No Comments"
        description="This post doesn't have any comments yet."
      />
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => (
        <CommunityCommentItem
          key={comment.id}
          comment={comment}
        />
      ))}
    </div>
  );
}