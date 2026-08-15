"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { trainerService } from "@/src/features/trainers/services/trainer.service";

import {
  DEFAULT_TRAINER_PAGE_SIZE,
} from "@/src/features/trainers/constants/trainer.constants";

import type {
  TrainerFilters,
  TrainerListItem,
} from "@/src/features/trainers/types/trainer.types";

const SEARCH_DEBOUNCE_MS = 400;

interface UseTrainersReturn {
  trainers: TrainerListItem[];

  total: number;

  /** Alias of total for legacy callers. */
  count: number;

  isInitialLoading: boolean;

  isFetching: boolean;

  /** Alias of isInitialLoading for legacy callers. */
  isLoading: boolean;

  error: string | null;

  filters: TrainerFilters;

  setFilters: (filters: TrainerFilters) => void;

  refetch: () => Promise<void>;
}

export const useTrainers = (options?: {
  pageSize?: number;
}): UseTrainersReturn => {
  const defaultPageSize =
    options?.pageSize ?? DEFAULT_TRAINER_PAGE_SIZE;

  const [trainers, setTrainers] = useState<
    TrainerListItem[]
  >([]);

  const [total, setTotal] = useState(0);

  const [isInitialLoading, setIsInitialLoading] =
    useState(true);

  const [isFetching, setIsFetching] = useState(false);

  const [error, setError] = useState<string | null>(
    null
  );

  const [filters, setFiltersState] =
    useState<TrainerFilters>({
      search: "",
      trainerType: undefined,
      status: undefined,
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
    (next: TrainerFilters) => {
      setFiltersState((prev) => {
        const statusChanged =
          next.status !== prev.status;
        const trainerTypeChanged =
          next.trainerType !== prev.trainerType;
        const pageSizeChanged =
          next.pageSize !== prev.pageSize;

        const shouldResetPage =
          statusChanged ||
          trainerTypeChanged ||
          pageSizeChanged;

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

  const fetchTrainers = useCallback(
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

        const response = await trainerService.getTrainers({
          search: debouncedSearch,
          trainerType: filters.trainerType,
          status: filters.status,
          page: filters.page ?? 1,
          pageSize:
            filters.pageSize ?? DEFAULT_TRAINER_PAGE_SIZE,
        });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setTrainers(response.data.items);
        setTotal(response.data.count);
        setError(null);
        hasLoadedRef.current = true;
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          err instanceof Error
            ? err.message
            : "Failed to fetch trainers";

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
      filters.trainerType,
      filters.status,
      filters.page,
      filters.pageSize,
    ]
  );

  useEffect(() => {
    void fetchTrainers();
  }, [fetchTrainers]);

  return {
    trainers,
    total,
    count: total,
    isInitialLoading,
    isFetching,
    isLoading: isInitialLoading,
    error,
    filters,
    setFilters,
    refetch: () => fetchTrainers({ silent: false }),
  };
};
