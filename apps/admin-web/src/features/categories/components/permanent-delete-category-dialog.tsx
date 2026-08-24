"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface PermanentDeleteCategoryDialogProps {
  open: boolean;
  category: CategoryListItem | null;
  isLoading: boolean;
  description: string;
  canDelete: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PermanentDeleteCategoryDialog({
  open,
  category,
  isLoading,
  description,
  canDelete,
  onClose,
  onConfirm,
}: PermanentDeleteCategoryDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={
        canDelete
          ? "Permanently delete category?"
          : "Cannot permanently delete category"
      }
      description={description}
      confirmLabel={canDelete ? "Permanently Delete" : "Close"}
      confirmVariant={canDelete ? "danger" : "outline"}
      loadingLabel={isLoading ? "Checking..." : "Permanently Deleting..."}
      loading={isLoading}
      showCancel={canDelete}
      onCancel={onClose}
      onConfirm={() => {
        if (!canDelete) {
          onClose();
          return;
        }

        void onConfirm();
      }}
    />
  );
}
