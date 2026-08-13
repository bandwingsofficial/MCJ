"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";

import type {
  CreateCategoryRequest,
  CategoryDetails,
} from "@/src/features/categories/types/category.types";

interface ApiError {
  response?: {
    data?: {
      code?: string;
      message?: string;
    };
  };
}

export const useCreateCategory =
  () => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const createCategory =
      async (
        payload: CreateCategoryRequest
      ): Promise<CategoryDetails | null> => {
        try {
          setIsLoading(true);

          const response =
            await categoryService.createCategory(
              payload
            );

          appToast.success(
            response.message
          );

          return response.data;
        } catch (error) {
          const apiError =
            error as ApiError;

          const code =
            apiError.response?.data
              ?.code;

          const message =
            apiError.response?.data
              ?.message;

          switch (code) {
            case "CATEGORY_ALREADY_EXISTS":
              appToast.error(
                "Category already exists"
              );
              return null;

            default:
              appToast.error(
                message ??
                  "Failed to create category"
              );

              return null;
          }
        } finally {
          setIsLoading(false);
        }
      };

    return {
      createCategory,
      isLoading,
    };
  };