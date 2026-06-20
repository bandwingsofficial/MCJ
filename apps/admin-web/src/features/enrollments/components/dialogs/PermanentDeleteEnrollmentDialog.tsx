"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface PermanentDeleteEnrollmentDialogProps {
  open: boolean;

  isLoading?: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function PermanentDeleteEnrollmentDialog({
  open,
  isLoading,
  onClose,
  onConfirm,
}: PermanentDeleteEnrollmentDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Permanent Delete"
      description="This action cannot be undone. Are you sure?"
      onCancel={onClose}
      onConfirm={onConfirm}
      loading={isLoading}
    />
  );
}