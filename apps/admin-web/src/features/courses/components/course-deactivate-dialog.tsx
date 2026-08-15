"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  onClose: () => void;

  onConfirm: () => void;

  isLoading?: boolean;
}

export function CourseDeactivateDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Deactivate course?"
      description="Students will no longer be able to access this course."
      confirmLabel="Deactivate"
      confirmVariant="danger"
      loading={isLoading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}