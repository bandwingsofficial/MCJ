"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { useRestoreCommunityPost } from "@/src/features/community/hooks/use-community-actions";

interface RestoreDialogProps {
  open: boolean;
  postId: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function RestoreDialog({
  open,
  postId,
  onClose,
  onSuccess,
}: RestoreDialogProps) {
  const { restoreCommunityPost, isLoading } = useRestoreCommunityPost();

  const handleConfirm = async () => {
    if (!postId) {
      return;
    }

    const success = await restoreCommunityPost(postId);

    if (success) {
      onSuccess?.();
      onClose();
    }
  };

  return (
    <ConfirmDialog
      open={open}
      title="Restore Community Post"
      description="Are you sure you want to restore this community post?"
      confirmLabel="Restore"
      loading={isLoading}
      onConfirm={handleConfirm}
      onCancel={onClose}
    />
  );
}
