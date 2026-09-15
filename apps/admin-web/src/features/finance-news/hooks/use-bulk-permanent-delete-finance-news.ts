"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";

import type { BulkFinanceNewsOperationResult } from "@/src/features/finance-news/types/finance-news.types";

interface UseBulkPermanentDeleteFinanceNewsReturn {
  bulkPermanentDelete: (
    ids: string[],
  ) => Promise<BulkFinanceNewsOperationResult | null>;
  isPending: boolean;
}

export function useBulkPermanentDeleteFinanceNews(): UseBulkPermanentDeleteFinanceNewsReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkPermanentDelete = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await financeNewsService.bulkPermanentDelete(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to permanently delete financial news",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkPermanentDelete, isPending };
}
