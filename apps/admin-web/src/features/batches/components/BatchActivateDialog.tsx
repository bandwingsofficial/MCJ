"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface BatchActivateDialogProps {
  open: boolean;

  onConfirm: () => void;

  onCancel: () => void;
}

export function BatchActivateDialog({
  open,
  onConfirm,
  onCancel,
}: BatchActivateDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Activate Batch"
      description="This batch will become active again."
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}