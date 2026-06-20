"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface RestoreEnrollmentDialogProps {
  open: boolean;

  isLoading?: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function RestoreEnrollmentDialog({
  open,
  isLoading,
  onClose,
  onConfirm,
}: RestoreEnrollmentDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Restore Enrollment"
      description="Do you want to restore this enrollment?"
      onCancel={onClose}
      onConfirm={onConfirm}
      loading={isLoading}
    />
  );
}