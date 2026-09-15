"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { FinanceNewsForm } from "@/src/features/finance-news/components/finance-news-form";
import { useCreateFinanceNews } from "@/src/features/finance-news/hooks/use-create-finance-news";

import type { FinanceNewsFormValues } from "@/src/features/finance-news/schemas/finance-news.schema";
import type { FinanceNewsUploadFiles } from "@/src/features/finance-news/hooks/use-create-finance-news";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateFinanceNewsModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const { createFinanceNews, isPending, fieldErrors } =
    useCreateFinanceNews();

  const handleSubmit = async (
    values: FinanceNewsFormValues,
    files: FinanceNewsUploadFiles,
  ) => {
    const success = await createFinanceNews(values, files);

    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title="Create Article"
      onClose={onClose}
      bodyClassName="overflow-y-auto bg-white px-6 py-5"
    >
      <FinanceNewsForm
        key={open ? "create-finance-news-open" : "create-finance-news-closed"}
        mode="create"
        isSubmitting={isPending}
        externalErrors={fieldErrors}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
