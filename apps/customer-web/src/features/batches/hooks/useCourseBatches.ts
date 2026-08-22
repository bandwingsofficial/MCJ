"use client";

import { useEffect, useState } from "react";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { Batch } from "@/src/features/batches/types/batch.types";

export function useCourseBatches(courseId?: string) {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [isLoading, setIsLoading] = useState(Boolean(courseId));
  const [error, setError] = useState<string | null>(null);

  const fetchBatches = async () => {
    if (!courseId) {
      setBatches([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await batchService.getBatches({ courseId });
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
  }, [courseId]);

  return {
    batches,
    isLoading,
    error,
    refetch: fetchBatches,
  };
}
