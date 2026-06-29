"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  useRestoreCommunityPost,
} from "@/src/features/community/hooks";

interface RestoreDialogProps {
  open: boolean;

  postId: string | null;

  onClose: () => void;
}

export function RestoreDialog({
  open,
  postId,
  onClose,
}: RestoreDialogProps) {
  const restoreMutation =
    useRestoreCommunityPost();

  const handleConfirm =
    async () => {
      if (!postId) {
        return;
      }

      await appToast.promise(
        restoreMutation.mutateAsync(
          postId,
        ),
        {
          loading:
            "Restoring post...",

          success:
            "Post restored successfully.",

          error:
            "Failed to restore post.",
        },
      );

      onClose();
    };

  return (
    <ConfirmDialog
      open={open}
      title="Restore Community Post"
      description="Restore this deleted community post?"
      onConfirm={
        handleConfirm
      }
      onCancel={onClose}
    />
  );
}