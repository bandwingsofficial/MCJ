"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { branchService } from "@/src/features/branches/services/branch.service";

import {
  BranchFilters,
  BranchListItem,
} from "@/src/features/branches/types/branch.types";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

interface UseBranchesReturn {
  branches: BranchListItem[];

  total: number;

  /** Total branches in the catalog (non-archived, unfiltered). */
  catalogTotal: number;

  /** Alias of total for legacy callers. */
  count: number;

  isInitialLoading: boolean;

  isFetching: boolean;

  /** Alias of isInitialLoading for legacy callers. */
  isLoading: boolean;

  error: string | null;

  filters: BranchFilters;

  setFilters: (filters: BranchFilters) => void;

  refetch: () => Promise<void>;
}

export const useBranches = (options?: {
  pageSize?: number;
  includeDeleted?: boolean;
}): UseBranchesReturn => {
  const defaultPageSize =
    options?.pageSize ?? DEFAULT_PAGE_SIZE;
  const defaultIncludeDeleted =
    options?.includeDeleted ?? true;

  const [branches, setBranches] = useState<
    BranchListItem[]
  >([]);

  const [total, setTotal] = useState(0);

  const [catalogTotal, setCatalogTotal] = useState(0);

  const [isInitialLoading, setIsInitialLoading] =
    useState(true);

  const [isFetching, setIsFetching] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [filters, setFiltersState] =
    useState<BranchFilters>({
      search: "",
      status: undefined,
      includeDeleted: defaultIncludeDeleted,
      page: 1,
      pageSize: defaultPageSize,
    });

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  const setFilters = useCallback(
    (next: BranchFilters) => {
      setFiltersState((prev) => {
        const statusChanged =
          next.status !== prev.status;
        const pageSizeChanged =
          next.pageSize !== prev.pageSize;

        const shouldResetPage =
          statusChanged || pageSizeChanged;

        return {
          ...next,
          page: shouldResetPage ? 1 : next.page,
        };
      });
    },
    []
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const nextSearch = (filters.search ?? "").trim();

      setDebouncedSearch((prev) =>
        prev === nextSearch ? prev : nextSearch
      );

      setFiltersState((prev) =>
        prev.page === 1
          ? prev
          : { ...prev, page: 1 }
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search]);

  const refreshCatalogTotal = useCallback(async () => {
    try {
      const response = await branchService.getBranches({
        page: 1,
        pageSize: 1,
        includeDeleted: false,
      });
      setCatalogTotal(
        response.data.meta?.total ??
          response.data.count ??
          response.data.items.length,
      );
    } catch {
      // Header total is non-critical.
    }
  }, []);

  const fetchBranches = useCallback(
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

        const response =
          await branchService.getBranches({
            search: debouncedSearch,
            status: filters.status,
            includeDeleted: filters.includeDeleted,
            page: filters.page ?? 1,
            pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
          });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setBranches(response.data.items);
        setTotal(
          response.data.meta?.total ??
            response.data.count ??
            response.data.items.length
        );
        setError(null);
        hasLoadedRef.current = true;
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch branches";

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
      filters.includeDeleted,
      filters.page,
      filters.pageSize,
    ]
  );

  useEffect(() => {
    void fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    void refreshCatalogTotal();
  }, [refreshCatalogTotal]);

  return {
    branches,
    total,
    catalogTotal,
    count: total,
    isInitialLoading,
    isFetching,
    /** Alias of isInitialLoading for legacy callers. */
    isLoading: isInitialLoading,
    error,
    filters,
    setFilters,
    refetch: async () => {
      await fetchBranches({ silent: false });
      await refreshCatalogTotal();
    },
  };
};
