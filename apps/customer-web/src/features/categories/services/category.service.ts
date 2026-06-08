// src/features/categories/services/category.service.ts

import { AxiosError } from "axios";

import { getCategoriesApi } from "@/src/features/categories/api/category.api";

import {
  mapCategoryDtosToCategories,
} from "@/src/features/categories/mappers/category.mapper";

import type {
  Category,
  GetCategoriesParams,
} from "@/src/features/categories/types/category.types";

export async function getCategories(
  params?: GetCategoriesParams
): Promise<Category[]> {
  try {
    const response =
      await getCategoriesApi(params);

    return mapCategoryDtosToCategories(
      response.data
    );
  } catch (error) {
    if (error instanceof AxiosError) {
      throw error;
    }

    throw new Error(
      "Failed to fetch categories"
    );
  }
}