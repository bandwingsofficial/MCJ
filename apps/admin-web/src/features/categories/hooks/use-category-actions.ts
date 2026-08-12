"use client";

import {
  useState,
} from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";

import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { AxiosError } from "axios";

export const useCategoryActions =
  () => {
    const [
      isLoading,
      setIsLoading,
    ] = useState(false);

    const execute =
      async (
        action: () => Promise<unknown>,
        successMessage: string
      ) => {
        try {
          setIsLoading(true);

          await action();

          appToast.success(
            successMessage
          );
        } catch (error) {
          const code =
            error instanceof AxiosError
              ? (error.response?.data as {
                  code?: string;
                  message?: string;
                })?.code
              : undefined;

          if (
            code ===
            "CATEGORY_ALREADY_EXISTS"
          ) {
            appToast.error(
              "Cannot restore category because another category already uses this name."
            );
          } else {
            appToast.error(
              getErrorMessage(error)
            );
          }

          throw error;
        } finally {
          setIsLoading(false);
        }
      };

    return {
      isLoading,

      activateCategory: (
        id: string
      ) =>
        execute(
          () =>
            categoryService.activateCategory(
              id
            ),
          "Category activated"
        ),

      deactivateCategory: (
        id: string
      ) =>
        execute(
          () =>
            categoryService.deactivateCategory(
              id
            ),
          "Category deactivated"
        ),

      deleteCategory: (
        id: string
      ) =>
        execute(
          () =>
            categoryService.deleteCategory(
              id
            ),
          "Category archived"
        ),

      restoreCategory: (
        id: string
      ) =>
        execute(
          () =>
            categoryService.restoreCategory(
              id
            ),
          "Category restored"
        ),

      permanentlyDeleteCategory: (
        id: string
      ) =>
        execute(
          () =>
            categoryService.permanentlyDeleteCategory(
              id
            ),
          "Category permanently deleted"
        ),
    };
  };
