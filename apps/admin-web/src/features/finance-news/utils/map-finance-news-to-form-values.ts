import {
  defaultFinanceNewsFormValues,
  type FinanceNewsFormValues,
} from "@/src/features/finance-news/schemas/finance-news.schema";
import type { FinanceNewsDetails } from "@/src/features/finance-news/types/finance-news.types";

export function mapFinanceNewsToFormValues(
  article: FinanceNewsDetails,
): FinanceNewsFormValues {
  return {
    title: article.title ?? defaultFinanceNewsFormValues.title,
    shortDescription: article.shortDescription ?? "",
    content: article.content ?? "",
    categoryId: article.categoryId ?? article.category?.id ?? "",
    authorName: article.authorName ?? defaultFinanceNewsFormValues.authorName,
    tags: article.tags ?? [],
    status: article.status ?? "DRAFT",
    metaTitle: article.metaTitle ?? "",
    metaDescription: article.metaDescription ?? "",
    metaKeywords: article.metaKeywords ?? "",
  };
}
