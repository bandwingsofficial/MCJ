"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  isLoading: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function TrainerDeleteDialog({
  open,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Archive Trainer"
      description="Archive this trainer? They can be restored later."
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