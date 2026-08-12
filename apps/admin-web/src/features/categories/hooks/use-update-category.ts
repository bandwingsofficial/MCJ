"use client";

import {
  useState,
} from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";

import type {
  UpdateCategoryRequest,
} from "@/src/features/categories/types/category.types";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

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
        } catch (error) {
          appToast.error(
            getErrorMessage(error)
          );

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      updateCategory,
      isLoading,
    };
  };
