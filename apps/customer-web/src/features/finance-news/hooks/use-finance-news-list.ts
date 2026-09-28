"use client";

import { useQuery } from "@tanstack/react-query";

import {
  FINANCE_NEWS_LIST_PAGE_SIZE,
  FINANCE_NEWS_QUERY_KEYS,
} from "@/src/features/finance-news/constants/finance-news.constants";
import { listFinancialArticles } from "@/src/features/finance-news/services/finance-news.service";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";

export function useFinanceNewsList(
  params?: { skip?: number; take?: number; enabled?: boolean },
) {
  const skip = params?.skip ?? 0;
  const take = params?.take ?? FINANCE_NEWS_LIST_PAGE_SIZE;
  const enabled = params?.enabled ?? true;

  return useQuery({
    queryKey: FINANCE_NEWS_QUERY_KEYS.list(skip, take),
    queryFn: () => listFinancialArticles({ skip, take }),
    enabled,
    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}
