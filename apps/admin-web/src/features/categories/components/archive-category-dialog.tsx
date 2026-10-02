"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";

interface ArchiveCategoryDialogProps {
  open: boolean;
  category: CategoryListItem | null;
  isLoading: boolean;
  description: string;
  canProceed?: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function ArchiveCategoryDialog({
  open,
  isLoading,
  description,
  canProceed = true,
  onClose,
  onConfirm,
}: ArchiveCategoryDialogProps) {
  const blocked = !canProceed;

  return (
    <ConfirmDialog
      open={open}
      title={
        blocked
          ? "Cannot archive category"
          : "Archive category?"
      }
      description={description}
      confirmLabel={blocked ? "OK" : "Archive"}
      confirmVariant={blocked ? "primary" : "danger"}
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
