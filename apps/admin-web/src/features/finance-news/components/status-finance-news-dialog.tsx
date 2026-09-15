"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { FinanceNewsListItem } from "@/src/features/finance-news/types/finance-news.types";

interface Props {
  open: boolean;
  item: FinanceNewsListItem | null;
  mode: "activate" | "deactivate";
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function StatusFinanceNewsDialog({
  open,
  item,
  mode,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  const isDeactivate = mode === "deactivate";
  const title = item?.title ?? "this article";

  return (
    <ConfirmDialog
      open={open}
      title={isDeactivate ? "Deactivate article?" : "Activate article?"}
      description={
        isDeactivate
          ? `${title} will become inactive and hidden from active article lists.`
          : `${title} will become active and visible in article lists again.`
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
