"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  financeNewsService,
  resolveFinanceNewsListTotal,
} from "@/src/features/finance-news/services/finance-news.service";

import { DEFAULT_FINANCE_NEWS_PAGE_SIZE } from "@/src/features/finance-news/constants/finance-news.constants";

import type {
  FinanceNewsFilters,
  FinanceNewsListItem,
} from "@/src/features/finance-news/types/finance-news.types";

const SEARCH_DEBOUNCE_MS = 400;

interface UseFinanceNewsReturn {
  items: FinanceNewsListItem[];
  total: number;
  catalogTotal: number;
  count: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  filters: FinanceNewsFilters;
  setFilters: (filters: FinanceNewsFilters) => void;
  refetch: () => Promise<void>;
}

export const useFinanceNews = (options?: {
  pageSize?: number;
}): UseFinanceNewsReturn => {
  const defaultPageSize =
    options?.pageSize ?? DEFAULT_FINANCE_NEWS_PAGE_SIZE;

  const [items, setItems] = useState<FinanceNewsListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<FinanceNewsFilters>({
    search: "",
    categoryId: undefined,
    status: undefined,
    page: 1,
    pageSize: defaultPageSize,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilters = useCallback((next: FinanceNewsFilters) => {
    setFiltersState((prev) => {
      const statusChanged = next.status !== prev.status;
      const categoryChanged = next.categoryId !== prev.categoryId;
      const pageSizeChanged = next.pageSize !== prev.pageSize;

      const shouldResetPage =
        statusChanged || categoryChanged || pageSizeChanged;

      return {
        ...next,
        page: shouldResetPage ? 1 : next.page,
      };
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const nextSearch = (filters.search ?? "").trim();

      setDebouncedSearch((prev) =>
        prev === nextSearch ? prev : nextSearch,
      );

      setFiltersState((prev) =>
        prev.page === 1 ? prev : { ...prev, page: 1 },
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search]);

  const fetchItems = useCallback(
    async (options?: { silent?: boolean }) => {
      const requestId = ++requestIdRef.current;
      const silent = options?.silent === true;
      const isFirstLoad = !hasLoadedRef.current;

      try {
        if (isFirstLoad) {
          setIsInitialLoading(true);
        } else if (!silent) {
          setIsFetching(true);
        }

        const response = await financeNewsService.getFinanceNewsList({
          search: debouncedSearch,
          categoryId: filters.categoryId,
          status: filters.status,
          page: filters.page ?? 1,
          pageSize: filters.pageSize ?? DEFAULT_FINANCE_NEWS_PAGE_SIZE,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setItems(response.data);
        setTotal(resolveFinanceNewsListTotal(response));
        setError(null);
        hasLoadedRef.current = true;
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch financial news";

        setError(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsInitialLoading(false);
          setIsFetching(false);
        }
      }
    },
    [
      debouncedSearch,
      filters.categoryId,
      filters.status,
      filters.page,
      filters.pageSize,
    ],
  );

  const refreshCatalogTotal = useCallback(async () => {
    try {
      const response = await financeNewsService.getFinanceNewsList({
        page: 1,
        pageSize: 1,
        includeDeleted: true,
        isDeleted: false,
      });
      setCatalogTotal(resolveFinanceNewsListTotal(response));
    } catch {
      // Header total is non-critical.
    }
  }, []);

  useEffect(() => {
    void refreshCatalogTotal();
  }, [refreshCatalogTotal]);

  useEffect(() => {
    void fetchItems();
  }, [fetchItems]);

  return {
    items,
    total,
    catalogTotal,
    count: total,
    isInitialLoading,
    isFetching,
    isLoading: isInitialLoading,
    error,
    filters,
    setFilters,
    refetch: async () => {
      await fetchItems({ silent: false });
      await refreshCatalogTotal();
    },
  };
};
