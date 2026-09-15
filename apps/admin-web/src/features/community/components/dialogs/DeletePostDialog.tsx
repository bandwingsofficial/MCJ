"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { useDeleteCommunityPost } from "@/src/features/community/hooks/use-community-actions";

interface DeletePostDialogProps {
  open: boolean;
  postId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function DeletePostDialog({
  open,
  postId,
  onClose,
  onSuccess,
}: DeletePostDialogProps) {
  const { deleteCommunityPost, isLoading } = useDeleteCommunityPost();

  const handleConfirm = async () => {
    if (!postId) {
      return;
    }

    const success = await deleteCommunityPost(postId);

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <ConfirmDialog
      open={open}
      title="Delete Community Post"
      description="Are you sure you want to delete this community post?"
      confirmLabel="Archive"
      confirmVariant="danger"
      loading={isLoading}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
