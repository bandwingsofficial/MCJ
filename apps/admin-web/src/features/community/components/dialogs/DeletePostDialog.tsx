"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { useDeleteCommunityPost } from "@/src/features/community/hooks";

interface DeletePostDialogProps {
  open: boolean;

  postId: string | null;

  onClose: () => void;
}

export function DeletePostDialog({
  open,
  postId,
  onClose,
}: DeletePostDialogProps) {
  const deleteMutation =
    useDeleteCommunityPost();

  const handleConfirm =
    async () => {
      if (!postId) {
        return;
      }

      await appToast.promise(
        deleteMutation.mutateAsync(
          postId,
        ),
        {
          loading:
            "Deleting post...",

          success:
            "Post deleted successfully.",

          error:
            "Failed to delete post.",
        },
      );

      onClose();
    };

  return (
    <ConfirmDialog
      open={open}
      title="Delete Community Post"
      description="Are you sure you want to delete this community post?"
      onConfirm={
        handleConfirm
      }
      onCancel={onClose}
    />
  );
}