"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  onClose: () => void;

  onConfirm: () => void;

  isLoading?: boolean;
}

export function CourseActivateDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Activate course?"
      description="Are you sure you want to activate this course?"
      confirmLabel="Activate"
      loading={isLoading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}