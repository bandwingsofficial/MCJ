"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  loading: boolean;

  title: string;

  description: string;

  confirmLabel?: string;

  loadingLabel?: string;

  showCancel?: boolean;

  confirmVariant?: "primary" | "danger" | "success" | "outline";

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
  showCancel = true,
  confirmVariant = "danger",
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
      showCancel={showCancel}
      confirmVariant={confirmVariant}
      onConfirm={onConfirm}
      onCancel={onCancel}
    />
  );
}
