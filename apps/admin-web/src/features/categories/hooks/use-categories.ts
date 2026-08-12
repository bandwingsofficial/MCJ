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
const SEARCH_DEBOUNCE_MS = 350;

interface UseCategoriesReturn {
  categories: CategoryListItem[];

  total: number;

  isLoading: boolean;

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

    const [isLoading, setIsLoading] =
      useState(true);

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

    const debounceRef = useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

    const setFilters = useCallback(
      (next: CategoryFilters) => {
        setFiltersState((prev) => {
          const searchChanged =
            next.search !== prev.search;
          const statusChanged =
            next.status !== prev.status;
          const pageSizeChanged =
            next.pageSize !== prev.pageSize;

          const shouldResetPage =
            searchChanged ||
            statusChanged ||
            pageSizeChanged;

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
        setDebouncedSearch(filters.search.trim());
      }, SEARCH_DEBOUNCE_MS);

      return () => {
        if (debounceRef.current) {
          clearTimeout(debounceRef.current);
        }
      };
    }, [filters.search]);

    const fetchCategories =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await categoryService.getCategories({
              ...filters,
              search: debouncedSearch,
            });

          setCategories(response.data);
          setTotal(response.meta?.total ?? response.data.length);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch categories";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters, debouncedSearch]);

    useEffect(() => {
      void fetchCategories();
    }, [fetchCategories]);

    return {
      categories,
      total,
      isLoading,
      error,
      filters,
      setFilters,
      refetch:
        fetchCategories,
    };
  };
