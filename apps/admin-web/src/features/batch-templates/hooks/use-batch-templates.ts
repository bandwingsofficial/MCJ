"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";
import type { BatchMode } from "@/src/features/batches/types/batch.types";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

export type BatchTimingStatusFilter = "ACTIVE" | "INACTIVE" | "ARCHIVED";
export type BatchTimingModeFilter = BatchMode;

export type BatchTimingFilters = {
  search: string;
  mode?: BatchTimingModeFilter;
  status?: BatchTimingStatusFilter;
  page: number;
  pageSize: number;
};

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

function listParamsForStatus(status?: BatchTimingStatusFilter): {
  isActive?: boolean;
  isDeleted?: boolean;
  includeDeleted?: boolean;
} {
  switch (status) {
    case "ACTIVE":
      return { isActive: true, isDeleted: false };
    case "INACTIVE":
      return { isActive: false, isDeleted: false };
    case "ARCHIVED":
      return { isDeleted: true };
    default:
      return { includeDeleted: true };
  }
}

export function useBatchTemplates() {
  const [templates, setTemplates] = useState<BatchTemplate[]>([]);
  const [total, setTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<BatchTimingFilters>({
    search: "",
    mode: undefined,
    status: undefined,
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [filters.search]);

  useEffect(() => {
    setFilters((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));
  }, [debouncedSearch]);

  const load = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setIsFetching(true);
    setError(null);

    try {
      const statusParams = listParamsForStatus(filters.status);
      const result = await batchTemplateService.listTemplatesPage({
        search: debouncedSearch || undefined,
        mode: filters.mode,
        ...statusParams,
        page: filters.page,
        pageSize: filters.pageSize,
      });

      if (requestId !== requestIdRef.current) {
        return;
      }

      setTemplates(result.items);
      setTotal(result.total);
      setCatalogTotal(result.catalogTotal);
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
    filters.mode,
    filters.page,
    filters.pageSize,
    filters.status,
  ]);

  useEffect(() => {
    void load();
  }, [load]);

  return {
    templates,
    total,
    catalogTotal,
    isInitialLoading,
    isFetching,
    error,
    filters,
    setFilters,
    refetch: load,
  };
}
