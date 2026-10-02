"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface CourseLessonDeleteDialogProps {
  open: boolean;
  loading: boolean;
  description: string;
  canDelete: boolean;
  contentLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CourseLessonDeleteDialog({
  open,
  loading,
  description,
  canDelete,
  contentLabel = "lesson",
  onClose,
  onConfirm,
}: CourseLessonDeleteDialogProps) {
  const title = canDelete
    ? `Delete ${contentLabel}?`
    : `Cannot delete ${contentLabel.toLowerCase()}`;

  return (
    <ConfirmDialog
      open={open}
      title={title}
      description={description}
      loading={loading && canDelete}
      confirmLabel={canDelete ? "Delete Permanently" : "OK"}
      loadingLabel="Deleting..."
      confirmVariant={canDelete ? "danger" : "primary"}
      showCancel={canDelete}
      onCancel={onClose}
      onConfirm={() => {
        if (!canDelete) {
          onClose();
          return;
        }

        onConfirm();
      }}
    />
  );
}
