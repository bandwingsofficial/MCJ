"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";

import type { BulkFinanceNewsOperationResult } from "@/src/features/finance-news/types/finance-news.types";

interface UseBulkDeleteFinanceNewsReturn {
  bulkDelete: (
    ids: string[],
  ) => Promise<BulkFinanceNewsOperationResult | null>;
  isPending: boolean;
}

export function useBulkDeleteFinanceNews(): UseBulkDeleteFinanceNewsReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkDelete = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await financeNewsService.bulkDelete(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to archive financial news",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkDelete, isPending };
}
