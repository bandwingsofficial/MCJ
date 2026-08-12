"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  loading: boolean;

  title: string;

  description: string;

  confirmLabel?: string;

  loadingLabel?: string;

  onConfirm: () => void;

  onCancel: () => void;
}

export function DeleteCategoryDialog({
  open,
  loading,
  title,
  description,
  confirmLabel = "Confirm",
  loadingLabel,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      loading={loading}
      title={title}
      description={description}
      confirmLabel={confirmLabel}
      loadingLabel={loadingLabel}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
