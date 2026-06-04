"use client";

import {
  useState,
} from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";

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
        } catch {
          appToast.error(
            "Action failed"
          );

          throw new Error(
            "Action failed"
          );
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
          "Category deleted"
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