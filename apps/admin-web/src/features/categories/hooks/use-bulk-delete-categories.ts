"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";
import type { BulkCategoryOperationResult } from "@/src/features/categories/types/category.types";

interface UseBulkDeleteCategoriesReturn {
  bulkDeleteCategories: (
    categoryIds: string[]
  ) => Promise<BulkCategoryOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeleteCategories(): UseBulkDeleteCategoriesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDeleteCategories = async (categoryIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await categoryService.bulkDeleteCategories(categoryIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to archive categories"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDeleteCategories, isPending };
}
