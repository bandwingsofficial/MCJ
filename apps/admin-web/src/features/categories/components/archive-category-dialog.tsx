"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface ArchiveCategoryDialogProps {
  open: boolean;
  category: CategoryListItem | null;
  isLoading: boolean;
  description: string;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ArchiveCategoryDialog({
  open,
  category,
  isLoading,
  description,
  onClose,
  onConfirm,
}: ArchiveCategoryDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title={
        category?.name
          ? `Archive ${category.name}?`
          : "Archive category?"
      }
      description={description}
      confirmLabel="Archive"
      confirmVariant="danger"
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
