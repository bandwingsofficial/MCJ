"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface StatusCategoryDialogProps {
  open: boolean;
  category: CategoryListItem | null;
  mode: "activate" | "deactivate";
  description: string;
  isLoading: boolean;
  canProceed?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function StatusCategoryDialog({
  open,
  category,
  mode,
  description,
  isLoading,
  canProceed = true,
  onClose,
  onConfirm,
}: StatusCategoryDialogProps) {
  const isDeactivate = mode === "deactivate";
  const name = category?.name ?? "this category";
  const blocked = isDeactivate && !canProceed;

  return (
    <ConfirmDialog
      open={open}
      title={
        blocked
          ? "Cannot deactivate category"
          : isDeactivate
            ? "Deactivate category?"
            : "Activate category?"
      }
      description={
        description ||
        (isDeactivate
          ? `${name} will become inactive and hidden from active category lists.`
          : `${name} will become active and visible in category lists again.`)
      }
      confirmLabel={
        blocked ? "OK" : isDeactivate ? "Deactivate" : "Activate"
      }
      confirmVariant={blocked ? "primary" : isDeactivate ? "danger" : "success"}
      loading={isLoading && !blocked}
      showCancel={!blocked}
      onCancel={onClose}
      onConfirm={() => {
        if (blocked) {
          onClose();
          return;
        }

        void onConfirm();
      }}
    />
  );
}
