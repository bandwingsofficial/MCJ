"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface CourseResourceDeleteDialogProps {
  open: boolean;

  loading?: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function CourseResourceDeleteDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: CourseResourceDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Resource"
      description="This resource will be moved to trash. You can restore it later."
      loading={loading}
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}