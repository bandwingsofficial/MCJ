"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

interface StatusTrainerDialogProps {
  open: boolean;
  trainer: TrainerListItem | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function StatusTrainerDialog({
  open,
  trainer,
  isLoading,
  onClose,
  onConfirm,
}: StatusTrainerDialogProps) {
  const isActive = trainer?.status === "ACTIVE";
  const fullName = trainer
    ? [trainer.firstName, trainer.lastName]
        .filter(Boolean)
        .join(" ")
    : "";

  return (
    <ConfirmDialog
      open={open}
      title={isActive ? "Deactivate Trainer" : "Activate Trainer"}
      description={`Are you sure you want to ${
        isActive ? "deactivate" : "activate"
      } ${fullName}?`}
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
