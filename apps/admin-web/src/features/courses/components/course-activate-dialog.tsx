"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function CourseActivateDialog({
  open,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Activate Course"
      description="Are you sure you want to activate this course?"
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}