// src/features/categories/hooks/use-categories.ts

import { useQuery } from "@tanstack/react-query";

import {
  CATEGORY_QUERY_KEYS,
} from "@/src/features/categories/constants/category.constants";

import {
  getCategories,
} from "@/src/features/categories/services/category.service";

import type {
  GetCategoriesParams,
} from "@/src/features/categories/types/category.types";

export function useCategories(
  params?: GetCategoriesParams
) {
  return useQuery({
    queryKey:
      CATEGORY_QUERY_KEYS.list(
        params?.search,
        params?.branchId
      ),

    queryFn: () =>
      getCategories(params),

    staleTime:
      1000 * 60 * 5,
  });
}