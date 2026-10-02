"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { TrainerListItem } from "@/src/features/trainers/types/trainer.types";

interface PermanentDeleteTrainerDialogProps {
  open: boolean;
  trainer: TrainerListItem | null;
  isLoading: boolean;
  description: string;
  canDelete: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PermanentDeleteTrainerDialog({
  open,
  isLoading,
  description,
  canDelete,
  onClose,
  onConfirm,
}: PermanentDeleteTrainerDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={
        canDelete ? "Permanently delete trainer?" : "Cannot delete trainer"
      }
      description={description}
      confirmLabel={canDelete ? "Permanently Delete" : "OK"}
      confirmVariant={canDelete ? "danger" : "primary"}
      loadingLabel={isLoading ? "Checking..." : "Permanently Deleting..."}
      loading={isLoading}
      showCancel={canDelete}
      onCancel={onClose}
      onConfirm={() => {
        if (!canDelete) {
          onClose();
          return;
        }

        void onConfirm();
      }}
    />
  );
}
