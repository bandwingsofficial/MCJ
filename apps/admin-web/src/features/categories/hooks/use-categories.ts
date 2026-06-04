"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { categoryService } from "@/src/features/categories/services/category.service";

import {
  CategoryFilters,
  CategoryListItem,
} from "@/src/features/categories/types/category.types";

interface UseCategoriesReturn {
  categories: CategoryListItem[];

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

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFilters] =
      useState<CategoryFilters>({
        search: "",
        includeDeleted: false,
        branchId: undefined,
        status: undefined,
      });

    const fetchCategories =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await categoryService.getCategories(
              filters
            );

          setCategories(
            response.data
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch categories";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchCategories();
    }, [fetchCategories]);

    return {
      categories,
      isLoading,
      error,
      filters,
      setFilters,
      refetch:
        fetchCategories,
    };
  };