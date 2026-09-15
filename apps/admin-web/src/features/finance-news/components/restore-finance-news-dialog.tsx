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

export function RestoreFinanceNewsDialog({
  open,
  item,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Restore article?"
      description={`Restore ${item?.title ?? "this article"}? It will become available again in article lists.`}
      confirmLabel="Restore"
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
