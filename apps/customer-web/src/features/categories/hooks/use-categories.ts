// src/features/categories/hooks/use-categories.ts

import { useQuery } from "@tanstack/react-query";

import {
  CATEGORY_QUERY_KEYS,
} from "@/src/features/categories/constants/category.constants";

import {
  getCategories,
} from "@/src/features/categories/services/category.service";
import { ENTITY_IMAGE_QUERY_OPTIONS } from "@/src/shared/lib/entity-image-query";

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

    ...ENTITY_IMAGE_QUERY_OPTIONS,
  });
}