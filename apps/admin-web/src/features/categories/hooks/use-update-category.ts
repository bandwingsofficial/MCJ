"use client";

import {
  useState,
} from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";

import type {
  UpdateCategoryRequest,
} from "@/src/features/categories/types/category.types";

export const useUpdateCategory =
  () => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const updateCategory =
      async (
        id: string,
        payload: UpdateCategoryRequest
      ) => {
        try {
          setIsLoading(true);

          const response =
            await categoryService.updateCategory(
              id,
              payload
            );

          appToast.success(
            response.message
          );

          return response.data;
        } catch {
          appToast.error(
            "Failed to update category"
          );

          throw new Error(
            "Failed to update category"
          );
        } finally {
          setIsLoading(false);
        }
      };

    return {
      updateCategory,
      isLoading,
    };
  };