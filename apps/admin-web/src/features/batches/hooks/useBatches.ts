"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { batchService } from "@/src/features/batches/services/batch.service";
import type {
  BatchFilters,
  BatchListItem,
} from "@/src/features/batches/types/batch.types";
import { parseBatchListResponse } from "@/src/features/batches/utils/batch-list.utils";

const DEFAULT_PAGE_SIZE = 50;
const SEARCH_DEBOUNCE_MS = 400;

interface UseBatchesReturn {
  batches: BatchListItem[];
  total: number;
  catalogTotal: number;
  count: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  filters: BatchFilters;
  setFilters: (filters: BatchFilters) => void;
  refetch: () => Promise<void>;
}

export const useBatches = (options?: {
  pageSize?: number;
}): UseBatchesReturn => {
  const defaultPageSize = options?.pageSize ?? DEFAULT_PAGE_SIZE;

  const [batches, setBatches] = useState<BatchListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFiltersState] = useState<BatchFilters>({
    search: "",
    courseId: undefined,
    mode: undefined,
    status: undefined,
    page: 1,
    pageSize: defaultPageSize,
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");
  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilters = useCallback((next: BatchFilters) => {
    setFiltersState((prev) => {
      const filterChanged =
        next.search !== prev.search ||
        next.courseId !== prev.courseId ||
        next.mode !== prev.mode ||
        next.status !== prev.status ||
        next.pageSize !== prev.pageSize;

      return {
        ...next,
        page: filterChanged ? 1 : next.page,
      };
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const nextSearch = (filters.search ?? "").trim();
      setDebouncedSearch((prev) => (prev === nextSearch ? prev : nextSearch));
      setFiltersState((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search]);

  const refreshCatalogTotal = useCallback(async () => {
    try {
      const response = await batchService.getBatches({
        page: 1,
        pageSize: 1,
        includeDeleted: true,
        isDeleted: false,
      });
      const payload = parseBatchListResponse(response.data);
      setCatalogTotal(payload.count);
    } catch {
      // Header total is non-critical.
    }
  }, []);

  const fetchBatches = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    try {
      if (!hasLoadedRef.current) {
        setIsInitialLoading(true);
      } else {
        setIsFetching(true);
      }

      setError(null);

      const response = await batchService.getBatches({
        ...filters,
        search: debouncedSearch,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      const payload = parseBatchListResponse(response.data);
      setBatches(payload.items);
      setTotal(payload.count);
      hasLoadedRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(getErrorMessage(err));
    } finally {
      if (requestId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsFetching(false);
      }
    }
  }, [
    debouncedSearch,
    filters.courseId,
    filters.mode,
    filters.status,
    filters.page,
    filters.pageSize,
  ]);

  useEffect(() => {
    void refreshCatalogTotal();
  }, [refreshCatalogTotal]);

  useEffect(() => {
    void fetchBatches();
  }, [fetchBatches]);

  return {
    batches,
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
      await fetchBatches();
      await refreshCatalogTotal();
    },
  };
};
