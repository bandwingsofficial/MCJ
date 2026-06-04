"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  isLoading: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function TrainerRestoreDialog({
  open,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Restore Trainer"
      description="Restore this trainer?"
      onConfirm={
        onConfirm
      }
      onCancel={
        onClose
      }
      loading={
        isLoading
      }
    />
  );
}