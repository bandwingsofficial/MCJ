"use client";

import { useQuery } from "@tanstack/react-query";

import { FINANCE_NEWS_QUERY_KEYS } from "@/src/features/finance-news/constants/finance-news.constants";
import { getFinancialArticleBySlug } from "@/src/features/finance-news/services/finance-news.service";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";

export function useFinanceNewsArticle(slug: string, enabled = true) {
  return useQuery({
    queryKey: FINANCE_NEWS_QUERY_KEYS.detail(slug),
    queryFn: () => getFinancialArticleBySlug(slug),
    enabled: enabled && slug.trim().length > 0,
    retry: (failureCount, error) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 404) {
        return false;
      }
      return failureCount < 1;
    },
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}
