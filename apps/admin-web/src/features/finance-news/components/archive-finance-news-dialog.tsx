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

export function ArchiveFinanceNewsDialog({
  open,
  item,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title={
        item?.title ? `Archive ${item.title}?` : "Archive article?"
      }
      description="This article will be removed from the normal listing and can be restored later."
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
