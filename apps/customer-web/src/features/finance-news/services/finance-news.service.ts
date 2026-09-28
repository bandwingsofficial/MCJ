import {
  getFinancialArticleBySlugApi,
  listFinancialArticlesApi,
} from "@/src/features/finance-news/api/finance-news.api";
import type {
  FinancialArticleDetail,
  FinancialArticleListItem,
  ListFinancialArticlesParams,
} from "@/src/features/finance-news/types/finance-news.types";
import { syncFinanceNewsImageFields } from "@/src/features/finance-news/utils/finance-news-image.util";

export async function listFinancialArticles(
  params?: ListFinancialArticlesParams,
): Promise<{ items: FinancialArticleListItem[]; total: number }> {
  const response = await listFinancialArticlesApi(params);
  return {
    items: response.data.map((item) => syncFinanceNewsImageFields(item)),
    total: response.meta?.total ?? response.data.length,
  };
}

export async function getFinancialArticleBySlug(
  slug: string,
): Promise<FinancialArticleDetail> {
  const response = await getFinancialArticleBySlugApi(slug);
  return syncFinanceNewsImageFields(response.data);
}
