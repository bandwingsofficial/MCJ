"use client";

import { useState } from "react";

import { appToast } from "@/src/shared/components/ui/toast";

import { financeNewsService } from "@/src/features/finance-news/services/finance-news.service";

import type { BulkFinanceNewsOperationResult } from "@/src/features/finance-news/types/finance-news.types";

interface UseBulkRestoreFinanceNewsReturn {
  bulkRestore: (
    ids: string[],
  ) => Promise<BulkFinanceNewsOperationResult | null>;
  isPending: boolean;
}

export function useBulkRestoreFinanceNews(): UseBulkRestoreFinanceNewsReturn {
  const [isPending, setIsPending] = useState(false);

  const bulkRestore = async (ids: string[]) => {
    try {
      setIsPending(true);
      return await financeNewsService.bulkRestore(ids);
    } catch (error) {
      appToast.error(
        error instanceof Error
          ? error.message
          : "Failed to restore financial news",
      );
      return null;
    } finally {
      setIsPending(false);
    }
  };

  return { bulkRestore, isPending };
}
