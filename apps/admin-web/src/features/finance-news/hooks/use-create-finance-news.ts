"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { appToast } from "@/src/shared/components/ui/toast";

import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";
import { mapFinanceNewsApiError } from "@/src/features/finance-news/utils/finance-news-form-errors";

import type { FinanceNewsFormValues } from "@/src/features/finance-news/schemas/finance-news.schema";
import type { CreateFinanceNewsRequest } from "@/src/features/finance-news/types/finance-news.types";
import type { FinanceNewsFormFieldErrors } from "@/src/features/finance-news/utils/finance-news-form-errors";

import { normalizeFinanceNewsSlug } from "@/src/features/finance-news/schemas/finance-news.schema";
import { DEFAULT_AUTHOR_NAME } from "@/src/features/finance-news/constants/finance-news.constants";

export interface FinanceNewsUploadFiles {
  thumbnail?: File | null;
  banner?: File | null;
  removeThumbnail?: boolean;
  removeBanner?: boolean;
}

interface UseCreateFinanceNewsReturn {
  isLoading: boolean;
  isPending: boolean;
  fieldErrors: FinanceNewsFormFieldErrors;
  createFinanceNews: (
    values: FinanceNewsFormValues,
    files?: FinanceNewsUploadFiles,
  ) => Promise<boolean>;
  clearFieldErrors: () => void;
}

function toCreateRequest(
  values: FinanceNewsFormValues,
): CreateFinanceNewsRequest {
  const slug = values.slug?.trim()
    ? normalizeFinanceNewsSlug(values.slug)
    : undefined;

  return {
    title: values.title.trim(),
    categoryId: values.categoryId,
    content: values.content.trim(),
    slug: slug || undefined,
    shortDescription: values.shortDescription?.trim() || undefined,
    authorName: values.authorName?.trim() || DEFAULT_AUTHOR_NAME,
    authorImage: values.authorImage?.trim() || undefined,
    tags: values.tags.length > 0 ? values.tags : undefined,
    status: values.status,
  };
}

export const useCreateFinanceNews = (
  onSuccess?: () => void,
): UseCreateFinanceNewsReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] =
    useState<FinanceNewsFormFieldErrors>({});

  const createFinanceNews = async (
    values: FinanceNewsFormValues,
    files?: FinanceNewsUploadFiles,
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      setFieldErrors({});

      const payload = toCreateRequest(values);

      if (files?.thumbnail) {
        const uploadResponse = await financeNewsService.uploadImage(
          files.thumbnail,
        );
        payload.thumbnailFileId = uploadResponse.data.fileId;
      }

      if (files?.banner) {
        const uploadResponse = await financeNewsService.uploadImage(
          files.banner,
        );
        payload.bannerFileId = uploadResponse.data.fileId;
      }

      const response = await financeNewsService.createFinanceNews(payload);
      appToast.success(response.message);
      onSuccess?.();
      return true;
    } catch (error) {
      const mapped = mapFinanceNewsApiError(error);

      if (mapped.root && !(error instanceof AxiosError)) {
        appToast.error(mapped.root);
      } else if (mapped.root && !Object.keys(mapped).some((key) => key !== "root" && mapped[key as keyof typeof mapped])) {
        appToast.error(mapped.root);
      }

      setFieldErrors(mapped);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    isPending: isLoading,
    fieldErrors,
    createFinanceNews,
    clearFieldErrors: () => setFieldErrors({}),
  };
};
