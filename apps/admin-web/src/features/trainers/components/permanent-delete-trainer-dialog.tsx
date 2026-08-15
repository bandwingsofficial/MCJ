"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

interface PermanentDeleteTrainerDialogProps {
  open: boolean;
  trainer: TrainerListItem | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PermanentDeleteTrainerDialog({
  open,
  trainer,
  isLoading,
  onClose,
  onConfirm,
}: PermanentDeleteTrainerDialogProps) {
  const fullName = trainer
    ? [trainer.firstName, trainer.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <ConfirmDialog
      open={open}
      title="Permanently delete trainer?"
      description={`This action cannot be undone.${
        fullName ? ` (${fullName})` : ""
      }`}
      confirmLabel="Permanently Delete"
      loadingLabel="Permanently Deleting..."
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
