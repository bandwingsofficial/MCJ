"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";
import type { BulkCategoryOperationResult } from "@/src/features/categories/types/category.types";

interface UseBulkPermanentDeleteCategoriesReturn {
  bulkPermanentDeleteCategories: (
    categoryIds: string[]
  ) => Promise<BulkCategoryOperationResult | null>;
  isPending: boolean;
}

export function useBulkPermanentDeleteCategories(): UseBulkPermanentDeleteCategoriesReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkPermanentDeleteCategories = async (
    categoryIds: string[]
  ) => {
    try {
      setIsPending(true);
      const response =
        await categoryService.bulkPermanentDeleteCategories(
          categoryIds
        );
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete categories"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkPermanentDeleteCategories, isPending };
}
