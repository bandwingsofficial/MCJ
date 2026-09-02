/** Default page size used across Faculty portal list views. */
export const DEFAULT_PAGE_SIZE = 10;

/** Maximum rows requested for non-paginated summary/list helpers. */
export const MAX_LIST_TAKE = 100;

/**
 * Builds validated skip/take params for paginated branch-ops APIs.
 * Backend DTOs require take >= 1 when take is present.
 */
export function paginationParams(page: number, pageSize: number = DEFAULT_PAGE_SIZE) {
  const safePage = Number.isFinite(page) && page >= 1 ? Math.floor(page) : 1;
  const safeTake =
    Number.isFinite(pageSize) && pageSize >= 1
      ? Math.floor(pageSize)
      : DEFAULT_PAGE_SIZE;

  return {
    skip: (safePage - 1) * safeTake,
    take: safeTake,
  };
}
