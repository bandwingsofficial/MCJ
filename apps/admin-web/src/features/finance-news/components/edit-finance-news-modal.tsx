"use client";

import { useCallback, useEffect, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";

import { FinanceNewsForm } from "@/src/features/finance-news/components/finance-news-form";
import { useUpdateFinanceNews } from "@/src/features/finance-news/hooks/use-update-finance-news";
import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";
import { mapFinanceNewsToFormValues } from "@/src/features/finance-news/utils/map-finance-news-to-form-values";
import type { FinanceNewsDetails } from "@/src/features/finance-news/types/finance-news.types";
import type { FinanceNewsFormValues } from "@/src/features/finance-news/schemas/finance-news.schema";
import type { FinanceNewsUploadFiles } from "@/src/features/finance-news/hooks/use-create-finance-news";
import { withImageCacheBust } from "@/src/shared/utils/upload-image.util";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";

interface Props {
  open: boolean;
  newsId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditFinanceNewsModal({
  open,
  newsId,
  onClose,
  onSuccess,
}: Props) {
  const [article, setArticle] = useState<FinanceNewsDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { updateFinanceNews, isPending, fieldErrors } =
    useUpdateFinanceNews();

  const fetchArticle = useCallback(async () => {
    if (!newsId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await financeNewsService.getFinanceNews(newsId);
      setArticle(response.data);
    } catch (err) {
      setArticle(null);
      setError(
        err instanceof Error ? err.message : "Failed to load article",
      );
    } finally {
      setIsLoading(false);
    }
  }, [newsId]);

  useEffect(() => {
    if (open && newsId) {
      void fetchArticle();
    }

    if (!open) {
      setArticle(null);
      setError(null);
    }
  }, [open, newsId, fetchArticle]);

  const handleSubmit = async (
    values: FinanceNewsFormValues,
    files: FinanceNewsUploadFiles,
  ) => {
    if (!article) {
      return;
    }

    const success = await updateFinanceNews(
      article.id,
      values,
      files,
    );

    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Article"
      onClose={onClose}
      bodyClassName="max-h-[80vh] overflow-y-auto bg-white px-6 py-5"
    >
      {isLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <Loader />
        </div>
      ) : error || !article ? (
        <ErrorState
          title="Failed to load article"
          description={error ?? "Article not found"}
          onRetry={() => {
            void fetchArticle();
          }}
        />
      ) : (
        <FinanceNewsForm
          key={`${article.id}-${article.updatedAt}`}
          mode="edit"
          initialValues={mapFinanceNewsToFormValues(article)}
          thumbnailPreviewUrl={
            article.thumbnailUrl
              ? withImageCacheBust(
                  article.thumbnailUrl,
                  article.updatedAt,
                )
              : null
          }
          isSubmitting={isPending}
          externalErrors={fieldErrors}
          publishedAt={article.publishedAt}
          onCancel={onClose}
          onSubmit={handleSubmit}
        />
      )}
    </Modal>
  );
}