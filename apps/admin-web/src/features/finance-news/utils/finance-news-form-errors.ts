import { AxiosError } from "axios";

interface ApiErrorBody {
  code?: string;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    errors?: Record<string, string[]>;
  };
}

export interface FinanceNewsFormFieldErrors {
  title?: string;
  shortDescription?: string;
  content?: string;
  categoryId?: string;
  authorName?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  tags?: string;
  status?: string;
  thumbnail?: string;
  banner?: string;
  root?: string;
}

export function mapFinanceNewsApiError(
  error: unknown,
): FinanceNewsFormFieldErrors {
  if (!(error instanceof AxiosError)) {
    return {
      root:
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
    };
  }

  const data = error.response?.data as ApiErrorBody | undefined;
  const message = data?.message;
  const fieldErrors =
    data?.errors ??
    (
      data?.meta as { errors?: Record<string, string[]> } | undefined
    )?.errors ??
    {};

  const mapped: FinanceNewsFormFieldErrors = {};

  if (fieldErrors.title?.[0]) {
    mapped.title = fieldErrors.title[0];
  }

  if (fieldErrors.shortDescription?.[0]) {
    mapped.shortDescription = fieldErrors.shortDescription[0];
  }

  if (fieldErrors.content?.[0]) {
    mapped.content = fieldErrors.content[0];
  }

  if (fieldErrors.categoryId?.[0]) {
    mapped.categoryId = fieldErrors.categoryId[0];
  }

  if (fieldErrors.authorName?.[0]) {
    mapped.authorName = fieldErrors.authorName[0];
  }

  if (fieldErrors.metaTitle?.[0]) {
    mapped.metaTitle = fieldErrors.metaTitle[0];
  }

  if (fieldErrors.metaDescription?.[0]) {
    mapped.metaDescription = fieldErrors.metaDescription[0];
  }

  if (fieldErrors.metaKeywords?.[0]) {
    mapped.metaKeywords = fieldErrors.metaKeywords[0];
  }

  if (fieldErrors.tags?.[0]) {
    mapped.tags = fieldErrors.tags[0];
  }

  if (fieldErrors.status?.[0]) {
    mapped.status = fieldErrors.status[0];
  }

  if (fieldErrors.thumbnailFileId?.[0]) {
    mapped.thumbnail = fieldErrors.thumbnailFileId[0];
  }

  if (fieldErrors.bannerFileId?.[0]) {
    mapped.banner = fieldErrors.bannerFileId[0];
  }

  if (
    !mapped.title &&
    !mapped.shortDescription &&
    !mapped.content &&
    !mapped.categoryId &&
    !mapped.authorName &&
    !mapped.metaTitle &&
    !mapped.metaDescription &&
    !mapped.metaKeywords &&
    !mapped.tags &&
    !mapped.status &&
    !mapped.thumbnail &&
    !mapped.banner
  ) {
    mapped.root = message ?? "Request failed. Please try again.";
  }

  return mapped;
}
