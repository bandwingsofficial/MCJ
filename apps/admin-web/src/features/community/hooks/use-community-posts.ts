"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  communityService,
  resolveCommunityListTotal,
} from "@/src/features/community/services/community.service";

import { DEFAULT_COMMUNITY_PAGE_SIZE } from "@/src/features/community/constants/community.constants";

import type {
  CommunityFilters,
  CommunityPostListItem,
} from "@/src/features/community/types/community.types";

const SEARCH_DEBOUNCE_MS = 400;

interface UseCommunityPostsReturn {
  items: CommunityPostListItem[];
  total: number;
  catalogTotal: number;
  count: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  filters: CommunityFilters;
  setFilters: (filters: CommunityFilters) => void;
  refetch: () => Promise<void>;
}

export const useCommunityPosts = (options?: {
  pageSize?: number;
}): UseCommunityPostsReturn => {
  const defaultPageSize =
    options?.pageSize ?? DEFAULT_COMMUNITY_PAGE_SIZE;

  const [items, setItems] = useState<CommunityPostListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<CommunityFilters>({
    search: "",
    status: undefined,
    type: undefined,
    page: 1,
    pageSize: defaultPageSize,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilters = useCallback((next: CommunityFilters) => {
    setFiltersState((prev) => {
      const statusChanged = next.status !== prev.status;
      const typeChanged = next.type !== prev.type;
      const pageSizeChanged = next.pageSize !== prev.pageSize;

      const shouldResetPage =
        statusChanged || typeChanged || pageSizeChanged;

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

        const response = await communityService.getCommunityPostsList({
          search: debouncedSearch,
          status: filters.status,
          type: filters.type,
          page: filters.page ?? 1,
          pageSize: filters.pageSize ?? DEFAULT_COMMUNITY_PAGE_SIZE,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setItems(response.data);
        setTotal(resolveCommunityListTotal(response));
        setError(null);
        hasLoadedRef.current = true;
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch community posts";

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
      filters.status,
      filters.type,
      filters.page,
      filters.pageSize,
    ],
  );

  const refreshCatalogTotal = useCallback(async () => {
    try {
      const response = await communityService.getCommunityPostsList({
        page: 1,
        pageSize: 1,
        includeDeleted: true,
        isDeleted: false,
      });
      setCatalogTotal(resolveCommunityListTotal(response));
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
