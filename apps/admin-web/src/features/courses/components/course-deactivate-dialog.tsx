"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function CourseDeactivateDialog({
  open,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Deactivate Course"
      description="Students will no longer be able to access this course."
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}