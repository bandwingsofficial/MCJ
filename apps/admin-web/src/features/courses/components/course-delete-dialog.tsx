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

export function CourseDeleteDialog({
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
      title={canDelete ? "Archive course?" : "Cannot delete course"}
      description={description}
      confirmLabel={canDelete ? "Archive" : "OK"}
      confirmVariant={canDelete ? "danger" : "primary"}
      loading={isLoading && canDelete}
      loadingLabel="Archiving..."
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
