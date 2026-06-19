"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface BatchDeleteDialogProps {
  open: boolean;

  isLoading: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

export function BatchDeleteDialog({
  open,
  isLoading,
  onConfirm,
  onCancel,
}: BatchDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Batch"
      description="Are you sure you want to delete this batch?"
      loading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}