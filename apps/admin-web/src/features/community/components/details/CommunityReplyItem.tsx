"use client";

import { Avatar } from "@/src/shared/components/ui/avatar";

import type {
  CommunityComment,
} from "@/src/features/community/types/community.types";

interface CommunityReplyItemProps {
  reply: CommunityComment;
}

export function CommunityReplyItem({
  reply,
}: CommunityReplyItemProps) {
  return (
    <div className="ml-10 mt-4 flex gap-3">
      <Avatar
        src={reply.user.profileImage ?? ""}
        alt={reply.user.name}
        fallback={reply.user.name
          .substring(0, 2)
          .toUpperCase()}
      />

      <div>
        <p className="font-medium">
          {reply.user.name}
        </p>

        <p className="text-sm">
          {reply.content}
        </p>
      </div>
    </div>
  );
}