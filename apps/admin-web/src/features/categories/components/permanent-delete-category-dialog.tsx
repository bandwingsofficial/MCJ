"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface PermanentDeleteCategoryDialogProps {
  open: boolean;
  category: CategoryListItem | null;
  isLoading: boolean;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PermanentDeleteCategoryDialog({
  open,
  isLoading,
  description,
  onClose,
  onConfirm,
}: PermanentDeleteCategoryDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete category permanently?"
      description={description}
      confirmLabel="Delete Permanently"
      confirmVariant="danger"
      loadingLabel="Deleting..."
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
