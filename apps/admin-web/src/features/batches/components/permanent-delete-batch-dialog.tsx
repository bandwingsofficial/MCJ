"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface PermanentDeleteBatchDialogProps {
  open: boolean;
  batchName?: string;
  isLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

export function PermanentDeleteBatchDialog({
  open,
  batchName,
  isLoading,
  onCancel,
  onConfirm,
}: PermanentDeleteBatchDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Are you sure you want to permanently delete this batch?"
      description={`This action cannot be undone. The batch and its associated data will be permanently removed.${
        batchName ? ` (${batchName})` : ""
      }`}
      confirmLabel="Permanently Delete"
      loadingLabel="Permanently Deleting..."
      loading={isLoading}
      onCancel={onCancel}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
