"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;
  isLoading: boolean;
  description: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CoursePermanentDeleteDialog({
  open,
  isLoading,
  description,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Permanently delete course?"
      description={description}
      confirmLabel="Permanently Delete"
      confirmVariant="danger"
      loading={isLoading}
      loadingLabel="Permanently Deleting..."
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}
