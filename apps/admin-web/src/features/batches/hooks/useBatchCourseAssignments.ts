"use client";

import { useCallback, useEffect, useState } from "react";

import { batchService } from "@/src/features/batches/services/batch.service";
import type { BatchCourseAssignment } from "@/src/features/batches/types/batch.types";

interface UseBatchCourseAssignmentsReturn {
  assignments: BatchCourseAssignment[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBatchCourseAssignments(
  batchId: string,
): UseBatchCourseAssignmentsReturn {
  const [assignments, setAssignments] = useState<BatchCourseAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!batchId) {
      setAssignments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const items = await batchService.getBatchCourses(batchId);
      setAssignments(items);
    } catch (fetchError) {
      const message =
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch batch courses";
      setError(message);
      setAssignments([]);
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    assignments,
    isLoading,
    error,
    refetch,
  };
}
