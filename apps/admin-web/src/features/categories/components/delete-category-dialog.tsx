"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  loading: boolean;

  title: string;

  description: string;

  onConfirm: () => void;

  onCancel: () => void;
}

export function DeleteCategoryDialog({
  open,
  loading,
  title,
  description,
  onConfirm,
  onCancel,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      loading={loading}
      title={title}
      description={
        description
      }
      onConfirm={
        onConfirm
      }
      onCancel={onCancel}
    />
  );
}