"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface StatusCategoryDialogProps {
  open: boolean;
  category: CategoryListItem | null;
  mode: "activate" | "deactivate";
  description: string;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function StatusCategoryDialog({
  open,
  category,
  mode,
  description,
  isLoading,
  onClose,
  onConfirm,
}: StatusCategoryDialogProps) {
  const isDeactivate = mode === "deactivate";
  const name = category?.name ?? "this category";

  return (
    <ConfirmDialog
      open={open}
      title={isDeactivate ? "Deactivate category?" : "Activate category?"}
      description={
        description ||
        (isDeactivate
          ? `${name} will become inactive and hidden from active category lists.`
          : `${name} will become active and visible in category lists again.`)
      }
      confirmLabel={isDeactivate ? "Deactivate" : "Activate"}
      confirmVariant={isDeactivate ? "danger" : "success"}
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
