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
      title="Permanently delete batch?"
      description={`This action cannot be undone.${
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
