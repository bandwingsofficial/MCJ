"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface CourseLessonDeleteDialogProps {
  open: boolean;
  loading: boolean;
  lessonTitle?: string;
  contentLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CourseLessonDeleteDialog({
  open,
  loading,
  lessonTitle,
  contentLabel = "lesson",
  onClose,
  onConfirm,
}: CourseLessonDeleteDialogProps) {
  const title = `Delete ${contentLabel}?`;

  const description = lessonTitle
    ? `This action will permanently delete "${lessonTitle}".\nThis cannot be undone.`
    : `This action will permanently delete this ${contentLabel.toLowerCase()}.\nThis cannot be undone.`;

  return (
    <ConfirmDialog
      open={open}
      title={title}
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
