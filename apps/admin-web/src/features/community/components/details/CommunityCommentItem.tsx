"use client";

import { Avatar } from "@/src/shared/components/ui/avatar";
import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import {
  useBlockComment,
  useDeleteComment,
  useRestoreComment,
  useUnblockComment,
} from "@/src/features/community/hooks";

import type {
  CommunityComment,
} from "@/src/features/community/types/community.types";

import { CommunityReplyItem } from "./CommunityReplyItem";

interface CommunityCommentItemProps {
  comment: CommunityComment;
}

export function CommunityCommentItem({
  comment,
}: CommunityCommentItemProps) {
  const blockMutation =
    useBlockComment();

  const unblockMutation =
    useUnblockComment();

  const deleteMutation =
    useDeleteComment();

  const restoreMutation =
    useRestoreComment();

  return (
    <Card className="space-y-4 p-4">
      <div className="flex items-start justify-between">
        <div className="flex gap-3">
          <Avatar
            src={
              comment.user.profileImage ??
              ""
            }
            alt={comment.user.name}
            fallback={comment.user.name
              .substring(0, 2)
              .toUpperCase()}
          />

          <div>
            <p className="font-medium">
              {comment.user.name}
            </p>

            <p className="text-sm text-muted-foreground">
              {comment.content}
            </p>

            <div className="mt-2 flex gap-2">
              {comment.isBlocked && (
                <Badge variant="danger">
                  Blocked
                </Badge>
              )}

              {comment.isDeleted && (
                <Badge variant="warning">
                  Deleted
                </Badge>
              )}
            </div>
          </div>
        </div>

        <Dropdown
          trigger={
            <Button
              variant="outline"
            >
              Actions
            </Button>
          }
          items={[
            {
              label: comment.isBlocked
                ? "Unblock"
                : "Block",

              onClick: () =>
                comment.isBlocked
                  ? unblockMutation.mutate(
                      comment.id,
                    )
                  : blockMutation.mutate(
                      comment.id,
                    ),
            },

            {
              label: comment.isDeleted
                ? "Restore"
                : "Delete",

              onClick: () =>
                comment.isDeleted
                  ? restoreMutation.mutate(
                      comment.id,
                    )
                  : deleteMutation.mutate(
                      comment.id,
                    ),
            },
          ]}
        />
      </div>

      {comment.replies.length >
        0 && (
        <div className="space-y-3 border-l pl-6">
          {comment.replies.map(
            (reply) => (
              <CommunityReplyItem
                key={reply.id}
                reply={reply}
              />
            ),
          )}
        </div>
      )}
    </Card>
  );
}