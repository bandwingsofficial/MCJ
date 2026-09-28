import { apiClient } from "@/src/core/api/axios";

import type {
  GetFinancialArticleResponse,
  ListFinancialArticlesParams,
  ListFinancialArticlesResponse,
} from "@/src/features/finance-news/types/finance-news.types";

export async function listFinancialArticlesApi(
  params?: ListFinancialArticlesParams,
): Promise<ListFinancialArticlesResponse> {
  const response = await apiClient.get<ListFinancialArticlesResponse>(
    "/financial-articles",
    { params },
  );
  return response.data;
}

export async function getFinancialArticleBySlugApi(
  slug: string,
): Promise<GetFinancialArticleResponse> {
  const response = await apiClient.get<GetFinancialArticleResponse>(
    `/financial-articles/${encodeURIComponent(slug)}`,
  );
  return response.data;
}
