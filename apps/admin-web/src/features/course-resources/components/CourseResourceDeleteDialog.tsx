"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface CourseResourceDeleteDialogProps {
  open: boolean;
  loading?: boolean;
  resourceTitle?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CourseResourceDeleteDialog({
  open,
  loading,
  resourceTitle,
  onClose,
  onConfirm,
}: CourseResourceDeleteDialogProps) {
  const description = resourceTitle
    ? `This action will permanently delete "${resourceTitle}".\nThis cannot be undone.`
    : "This action will permanently delete this resource.\nThis cannot be undone.";

  return (
    <ConfirmDialog
      open={open}
      title="Delete Resource?"
      description={description}
      loading={loading}
      confirmLabel="Delete Permanently"
      loadingLabel="Deleting..."
      confirmVariant="danger"
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}
