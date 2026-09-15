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

export function RestoreCommunityPostDialog({
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
      title={`Restore ${label}?`}
      description="This post will be restored and available for management again."
      confirmLabel="Restore"
      confirmVariant="primary"
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
