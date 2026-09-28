export const FINANCE_NEWS_QUERY_KEYS = {
  all: ["finance-news"] as const,
  list: (skip?: number, take?: number) =>
    [...FINANCE_NEWS_QUERY_KEYS.all, "list", skip, take] as const,
  detail: (slug: string) =>
    [...FINANCE_NEWS_QUERY_KEYS.all, "detail", slug] as const,
};

export const FINANCE_NEWS_LIST_PAGE_SIZE = 9;
