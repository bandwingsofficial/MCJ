"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";

import type { BulkFinanceNewsOperationResult } from "@/src/features/finance-news/types/finance-news.types";

interface UseBulkActivateFinanceNewsReturn {
  bulkActivate: (
    ids: string[],
  ) => Promise<BulkFinanceNewsOperationResult | null>;
  isPending: boolean;
}

export function useBulkActivateFinanceNews(): UseBulkActivateFinanceNewsReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkActivate = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await financeNewsService.bulkActivate(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to activate financial news",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkActivate, isPending };
}
