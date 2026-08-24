"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { categoryService } from "@/src/features/categories/services/category.service";

import {
  CategoryFilters,
  CategoryListItem,
} from "@/src/features/categories/types/category.types";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

interface UseCategoriesReturn {
  categories: CategoryListItem[];

  total: number;

  /** Total categories in the catalog (unfiltered). */
  catalogTotal: number;

  /** True only for the first load when no rows exist yet. */
  isInitialLoading: boolean;

  /** True while a background refetch is in flight (keeps previous rows). */
  isFetching: boolean;

  error: string | null;

  filters: CategoryFilters;

  setFilters: (
    filters: CategoryFilters
  ) => void;

  refetch: () => Promise<void>;
}

export const useCategories =
  (): UseCategoriesReturn => {
    const [
      categories,
      setCategories,
    ] = useState<
      CategoryListItem[]
    >([]);

    const [total, setTotal] =
      useState(0);

    const [catalogTotal, setCatalogTotal] =
      useState(0);

    const [
      isInitialLoading,
      setIsInitialLoading,
    ] = useState(true);

    const [isFetching, setIsFetching] =
      useState(false);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFiltersState] =
      useState<CategoryFilters>({
        search: "",
        branchId: undefined,
        status: undefined,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      });

    const [debouncedSearch, setDebouncedSearch] =
      useState("");

    const hasLoadedRef = useRef(false);
    const requestIdRef = useRef(0);
    const debounceRef = useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

    const setFilters = useCallback(
      (next: CategoryFilters) => {
        setFiltersState((prev) => {
          const statusChanged =
            next.status !== prev.status;
          const pageSizeChanged =
            next.pageSize !== prev.pageSize;

          // Search text updates immediately for the input.
          // Page reset for search happens only when the debounced
          // query value changes (see debounce effect below).
          const shouldResetPage =
            statusChanged || pageSizeChanged;

          return {
            ...next,
            page: shouldResetPage
              ? 1
              : next.page,
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
        const nextSearch = filters.search.trim();

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

    const fetchCategories = useCallback(
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
            await categoryService.getCategories({
              search: debouncedSearch,
              branchId: filters.branchId,
              status: filters.status,
              page: filters.page,
              pageSize: filters.pageSize,
            });

          const catalogResponse =
            await categoryService.getCategories({
              search: "",
              page: 1,
              pageSize: 1,
            });

          if (requestId !== requestIdRef.current) {
            return;
          }

          setCategories(response.data);
          setTotal(
            response.meta?.total ??
              response.data.length
          );
          setCatalogTotal(
            catalogResponse.meta?.total ??
              catalogResponse.data.length
          );
          setError(null);
          hasLoadedRef.current = true;
        } catch (error) {
          if (requestId !== requestIdRef.current) {
            return;
          }

          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch categories";

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
        filters.branchId,
        filters.status,
        filters.page,
        filters.pageSize,
      ]
    );

    useEffect(() => {
      void fetchCategories();
    }, [fetchCategories]);

    return {
      categories,
      total,
      catalogTotal,
      isInitialLoading,
      isFetching,
      error,
      filters,
      setFilters,
      refetch: () =>
        fetchCategories({ silent: false }),
    };
  };
