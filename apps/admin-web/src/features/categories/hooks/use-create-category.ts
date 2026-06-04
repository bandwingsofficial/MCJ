"use client";

import {
  useState,
} from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";

import type {
  CreateCategoryRequest,
} from "@/src/features/categories/types/category.types";

export const useCreateCategory =
  () => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const createCategory =
      async (
        payload: CreateCategoryRequest
      ) => {
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
            error as {
              response?: {
                data?: {
                  code?: string;
                  message?: string;
                };
              };
            };

          const code =
            apiError.response?.data
              ?.code;

          if (
            code ===
            "CATEGORY_ALREADY_EXISTS"
          ) {
            appToast.error(
              "Category already exists"
            );

            throw error;
          }

          if (
            code ===
            "BRANCH_NOT_FOUND"
          ) {
            appToast.error(
              "Selected branch not found"
            );

            throw error;
          }

          appToast.error(
            "Failed to create category"
          );

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