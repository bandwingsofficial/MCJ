"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface BatchDeactivateDialogProps {
  open: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

export function BatchDeactivateDialog({
  open,
  onConfirm,
  onCancel,
}: BatchDeactivateDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Deactivate Batch"
      description="This batch will no longer be available."
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}