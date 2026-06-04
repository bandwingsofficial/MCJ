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
      title="Delete Trainer"
      description="Are you sure you want to delete this trainer?"
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