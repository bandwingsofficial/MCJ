"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function CourseRestoreDialog({
  open,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Restore Course"
      description="Restore this course and make it available again."
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}