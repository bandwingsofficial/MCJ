import type { FinanceArticleStatus } from "@/src/features/finance-news/types/finance-news.types";

export const DEFAULT_FINANCE_NEWS_PAGE_SIZE = 20;

export const FINANCE_NEWS_UPLOAD_FOLDER = "financial-articles";

export const DEFAULT_AUTHOR_NAME = "MCJ Team";

export const FINANCE_ARTICLE_AUTHOR_IMAGE_PATH = "/Logo/MCJ_logo.png";

export const SHORT_DESCRIPTION_MAX_CHARS = 500;

export const FINANCE_ARTICLE_STATUSES: FinanceArticleStatus[] = [
  "DRAFT",
  "PUBLISHED",
  "ARCHIVED",
];

export const FINANCE_ARTICLE_STATUS_LABELS: Record<
  FinanceArticleStatus,
  string
> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};
