"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CommunityPostListItem } from "@/src/features/community/types/community.types";
import { truncateCaption } from "@/src/features/community/utils/community-display.utils";

interface Props {
  open: boolean;
  item: CommunityPostListItem | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PermanentDeleteCommunityPostDialog({
  open,
  item,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  const label = item ? truncateCaption(item.caption, 60) : "this post";

  return (
    <ConfirmDialog
      open={open}
      title={`Permanently delete ${label}?`}
      description="This action cannot be undone. The post and its engagement data will be permanently removed."
      confirmLabel="Permanently Delete"
      confirmVariant="danger"
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
