"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;
  isLoading: boolean;
  description: string;
  canDeactivate: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CourseDeactivateDialog({
  open,
  isLoading,
  description,
  canDeactivate,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title={
        canDeactivate ? "Deactivate course?" : "Cannot deactivate course"
      }
      description={description}
      confirmLabel={canDeactivate ? "Deactivate" : "OK"}
      confirmVariant={canDeactivate ? "danger" : "primary"}
      loading={isLoading && canDeactivate}
      loadingLabel="Deactivating..."
      showCancel={canDeactivate}
      onCancel={onClose}
      onConfirm={() => {
        if (!canDeactivate) {
          onClose();
          return;
        }

        onConfirm();
      }}
    />
  );
}
