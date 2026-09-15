"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CommunityPostListItem } from "@/src/features/community/types/community.types";
import { truncateCaption } from "@/src/features/community/utils/community-display.utils";

interface Props {
  open: boolean;
  item: CommunityPostListItem | null;
  mode: "activate" | "deactivate";
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function StatusCommunityPostDialog({
  open,
  item,
  mode,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  const isDeactivate = mode === "deactivate";
  const title = item ? truncateCaption(item.caption, 60) : "this post";

  return (
    <ConfirmDialog
      open={open}
      title={isDeactivate ? "Deactivate post?" : "Activate post?"}
      description={
        isDeactivate
          ? `${title} will become inactive and hidden from active post lists.`
          : `${title} will become active and visible in post lists again.`
      }
      confirmLabel={isDeactivate ? "Deactivate" : "Activate"}
      confirmVariant={isDeactivate ? "danger" : "success"}
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
