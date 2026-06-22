"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface CourseModuleDeleteDialogProps {
  open: boolean;

  loading?: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function CourseModuleDeleteDialog({
  open,
  loading = false,
  onClose,
  onConfirm,
}: CourseModuleDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Course Module"
      description="Are you sure you want to delete this course module? You can restore it later."
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}