"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

interface StatusTrainerDialogProps {
  open: boolean;
  trainer: TrainerListItem | null;
  mode: "activate" | "deactivate";
  description: string;
  isLoading: boolean;
  canProceed?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function StatusTrainerDialog({
  open,
  trainer,
  mode,
  description,
  isLoading,
  canProceed = true,
  onClose,
  onConfirm,
}: StatusTrainerDialogProps) {
  const isDeactivate = mode === "deactivate";
  const fullName = trainer
    ? [trainer.firstName, trainer.lastName].filter(Boolean).join(" ")
    : "this trainer";
  const blocked = isDeactivate && !canProceed;

  return (
    <ConfirmDialog
      open={open}
      title={
        blocked
          ? "Cannot deactivate trainer"
          : isDeactivate
            ? "Deactivate trainer?"
            : "Activate trainer?"
      }
      description={
        description ||
        (isDeactivate
          ? `Are you sure you want to deactivate ${fullName}?`
          : `Are you sure you want to activate ${fullName}?`)
      }
      confirmLabel={blocked ? "OK" : isDeactivate ? "Deactivate" : "Activate"}
      confirmVariant={blocked ? "primary" : isDeactivate ? "danger" : "success"}
      loading={isLoading && !blocked}
      showCancel={!blocked}
      onCancel={onClose}
      onConfirm={() => {
        if (blocked) {
          onClose();
          return;
        }

        void onConfirm();
      }}
    />
  );
}
