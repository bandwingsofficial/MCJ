"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;
  isLoading: boolean;
  description: string;
  canDelete: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function TrainerDeleteDialog({
  open,
  isLoading,
  description,
  canDelete,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title={canDelete ? "Archive trainer?" : "Cannot delete trainer"}
      description={description}
      confirmLabel={canDelete ? "Archive" : "OK"}
      confirmVariant={canDelete ? "danger" : "primary"}
      loading={isLoading}
      loadingLabel={isLoading ? "Checking..." : "Archiving..."}
      showCancel={canDelete}
      onCancel={onClose}
      onConfirm={() => {
        if (!canDelete) {
          onClose();
          return;
        }

        onConfirm();
      }}
    />
  );
}
