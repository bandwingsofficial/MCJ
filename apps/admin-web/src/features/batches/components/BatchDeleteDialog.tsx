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
      title="Archive Batch"
      description="Are you sure you want to archive this batch? It can be restored later."
      loading={isLoading}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}