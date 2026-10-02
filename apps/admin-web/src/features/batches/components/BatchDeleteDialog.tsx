"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface BatchDeleteDialogProps {
  open: boolean;
  isLoading: boolean;
  description?: string;
  blocked?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function BatchDeleteDialog({
  open,
  isLoading,
  description = "Are you sure you want to archive this batch? It can be restored later.",
  blocked = false,
  onConfirm,
  onCancel,
}: BatchDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={blocked ? "Cannot archive batch" : "Archive Batch"}
      description={description}
      confirmLabel={blocked ? "OK" : "Archive"}
      confirmVariant={blocked ? "primary" : "danger"}
      loading={isLoading && !blocked}
      showCancel={!blocked}
      onConfirm={() => {
        if (blocked) {
          onCancel();
          return;
        }

        onConfirm();
      }}
      onCancel={onCancel}
    />
  );
}