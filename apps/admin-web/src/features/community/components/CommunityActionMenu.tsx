"use client";

import { Button } from "@/src/shared/components/ui/button";
import { Dropdown } from "@/src/shared/components/ui/dropdown";

import type {
  CommunityPost,
} from "@/src/features/community/types/community.types";

interface CommunityActionMenuProps {
  post: CommunityPost;

  onView: (post: CommunityPost) => void;

  onEdit: (post: CommunityPost) => void;

  onDelete: (post: CommunityPost) => void;

  onRestore: (post: CommunityPost) => void;

  onActivate: (post: CommunityPost) => void;

  onDeactivate: (post: CommunityPost) => void;
}

export function CommunityActionMenu({
  post,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onActivate,
  onDeactivate,
}: CommunityActionMenuProps) {
  return (
    <Dropdown
      trigger={
        <Button variant="outline">
          Actions
        </Button>
      }
      items={[
        {
          label: "View",
          onClick: () => onView(post),
        },
        {
          label: "Edit",
          onClick: () => onEdit(post),
        },
        {
          label: post.isActive
            ? "Deactivate"
            : "Activate",
          onClick: () =>
            post.isActive
              ? onDeactivate(post)
              : onActivate(post),
        },
        {
          label: post.isDeleted
            ? "Restore"
            : "Delete",
          onClick: () =>
            post.isDeleted
              ? onRestore(post)
              : onDelete(post),
        },
      ]}
    />
  );
}