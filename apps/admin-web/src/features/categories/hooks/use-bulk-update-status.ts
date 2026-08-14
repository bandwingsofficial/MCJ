"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { categoryService } from "@/src/features/categories/services/category.service";
import type {
  BulkCategoryOperationResult,
  CategoryStatus,
} from "@/src/features/categories/types/category.types";

interface UseBulkUpdateStatusReturn {
  bulkUpdateStatus: (
    categoryIds: string[],
    status: Exclude<CategoryStatus, "ARCHIVED">
  ) => Promise<BulkCategoryOperationResult | null>;
  isPending: boolean;
}

export function useBulkUpdateStatus(): UseBulkUpdateStatusReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkUpdateStatus = async (
    categoryIds: string[],
    status: Exclude<CategoryStatus, "ARCHIVED">
  ) => {
    try {
      setIsPending(true);
      const response = await categoryService.bulkUpdateStatus(
        categoryIds,
        status
      );
      return response.data;
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to update category statuses"
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkUpdateStatus, isPending };
}
