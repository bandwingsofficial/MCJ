"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { batchService } from "@/src/features/batches/services/batch.service";
import { batchTimingManagePath } from "@/src/features/batches/utils/batch-manage.routes";

import type {
  Batch,
  BatchTiming,
} from "@/src/features/batches/types/batch.types";

interface UseBatchTimingReturn {
  timing: BatchTiming | null;
  batch: Batch | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Loads one timing scoped to its parent batch. Both ids are required so a
 * timing can never be read through the wrong batch.
 */
export const useBatchTiming = (
  batchId: string,
  timingId: string,
): UseBatchTimingReturn => {
  const router = useRouter();
  const [timing, setTiming] = useState<BatchTiming | null>(null);
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiming = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const data = await batchService.getBatchTiming(batchId, timingId);

      if (
        data.canonicalBatchId &&
        data.canonicalBatchId !== batchId
      ) {
        router.replace(
          batchTimingManagePath(data.canonicalBatchId, timingId),
        );
        return;
      }

      setTiming(data.timing);
      setBatch(data.batch);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch batch timing",
      );
    } finally {
      setIsLoading(false);
    }
  }, [batchId, timingId, router]);

  useEffect(() => {
    if (!batchId || !timingId) {
      return;
    }

    void fetchTiming();
  }, [fetchTiming, batchId, timingId]);

  return { timing, batch, isLoading, error, refetch: fetchTiming };
};
