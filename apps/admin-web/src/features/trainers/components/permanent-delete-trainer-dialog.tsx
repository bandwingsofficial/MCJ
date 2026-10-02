"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

interface PermanentDeleteTrainerDialogProps {
  open: boolean;
  trainer: TrainerListItem | null;
  isLoading: boolean;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PermanentDeleteTrainerDialog({
  open,
  isLoading,
  description,
  onClose,
  onConfirm,
}: PermanentDeleteTrainerDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Permanently delete trainer?"
      description={description}
      confirmLabel="Permanently Delete"
      confirmVariant="danger"
      loadingLabel="Permanently Deleting..."
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
