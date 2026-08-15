"use client";

import { useCallback, useEffect, useState } from "react";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { BatchSummary } from "@/src/features/batches/types/batch.types";

interface UseBatchSummaryReturn {
  summary: BatchSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBatchSummary(batchId: string): UseBatchSummaryReturn {
  const [summary, setSummary] = useState<BatchSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!batchId) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response = await batchService.getBatchSummary(batchId);
      setSummary(response.data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load batch summary",
      );
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    summary,
    isLoading,
    error,
    refetch,
  };
}
