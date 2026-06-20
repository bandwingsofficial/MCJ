"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface DeleteEnrollmentDialogProps {
  open: boolean;

  isLoading?: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function DeleteEnrollmentDialog({
  open,
  isLoading,
  onClose,
  onConfirm,
}: DeleteEnrollmentDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Enrollment"
      description="Are you sure you want to delete this enrollment?"
      onCancel={onClose}
      onConfirm={onConfirm}
      loading={isLoading}
    />
  );
}