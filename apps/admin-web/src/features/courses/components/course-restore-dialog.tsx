"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  onClose: () => void;

  onConfirm: () => void;

  isLoading?: boolean;
}

export function CourseRestoreDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Restore course?"
      description="Restore this course and make it available again."
      confirmLabel="Restore"
      loading={isLoading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}