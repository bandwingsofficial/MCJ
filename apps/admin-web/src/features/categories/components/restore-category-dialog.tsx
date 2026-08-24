"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface RestoreCategoryDialogProps {
  open: boolean;
  category: CategoryListItem | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function RestoreCategoryDialog({
  open,
  category,
  isLoading,
  onClose,
  onConfirm,
}: RestoreCategoryDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Restore category?"
      description={`Restore ${category?.name ?? "this category"}? It will become available again in category lists.`}
      confirmLabel="Restore"
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
