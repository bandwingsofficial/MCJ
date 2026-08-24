"use client";

import { useState } from "react";

import { AxiosError } from "axios";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";

import type {
  CreateCategoryRequest,
  CategoryDetails,
} from "@/src/features/categories/types/category.types";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

export const useCreateCategory = () => {
  const [isLoading, setIsLoading] = useState(false);

  const createCategory = async (
    payload: CreateCategoryRequest,
  ): Promise<CategoryDetails> => {
    try {
      setIsLoading(true);

      const response = await categoryService.createCategory(payload);

      appToast.success(response.message);

      return response.data;
    } catch (error) {
      if (error instanceof AxiosError) {
        throw error;
      }

      appToast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCategory,
    isLoading,
  };
};
