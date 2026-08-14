"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";
import type { BulkCategoryOperationResult } from "@/src/features/categories/types/category.types";

interface UseBulkRestoreCategoriesReturn {
  bulkRestoreCategories: (
    categoryIds: string[]
  ) => Promise<BulkCategoryOperationResult | null>;
  isPending: boolean;
}

export function useBulkRestoreCategories(): UseBulkRestoreCategoriesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkRestoreCategories = async (categoryIds: string[]) => {
    try {
      setIsPending(true);
      const response =
        await categoryService.bulkRestoreCategories(categoryIds);
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore categories"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkRestoreCategories, isPending };
}
