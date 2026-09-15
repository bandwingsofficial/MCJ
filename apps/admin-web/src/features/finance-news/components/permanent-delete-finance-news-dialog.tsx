"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { FinanceNewsListItem } from "@/src/features/finance-news/types/finance-news.types";

interface Props {
  open: boolean;
  item: FinanceNewsListItem | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function PermanentDeleteFinanceNewsDialog({
  open,
  item,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Permanently delete article?"
      description={`This action cannot be undone.${item?.title ? ` (${item.title})` : ""}`}
      confirmLabel="Permanently Delete"
      loadingLabel="Permanently Deleting..."
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
