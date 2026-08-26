"use client";

import { useEffect, useState } from "react";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";

export function useCourseBatches(
  courseId?: string,
  branchId?: string,
  enabled = true,
) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(courseId) && enabled);
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = async () => {
    if (!courseId || !enabled) {
      setBatches([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await batchService.getAllBatches({
        courseId,
        branchId,
      });
      setBatches(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch batches",
      );
      setBatches([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchBatches();
  }, [courseId, branchId, enabled]);

  return {
    batches,
    isLoading,
    error,
    refetch: fetchBatches,
  };
}
