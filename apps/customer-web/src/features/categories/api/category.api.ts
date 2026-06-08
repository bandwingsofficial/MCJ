// src/features/categories/api/category.api.ts

import { apiClient } from "@/src/core/api/axios";

import type {
  GetCategoriesParams,
  GetCategoriesResponse,
} from "@/src/features/categories/types/category.types";

export async function getCategoriesApi(
  params?: GetCategoriesParams
): Promise<GetCategoriesResponse> {
  const response =
    await apiClient.get<GetCategoriesResponse>(
      "/categories",
      {
        params,
      }
    );

  return response.data;
}