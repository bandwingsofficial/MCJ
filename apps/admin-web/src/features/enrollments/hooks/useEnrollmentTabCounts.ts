"use client";

import { useCallback, useEffect, useState } from "react";

import { useRealtimeRefetch } from "@/src/core/realtime/use-realtime-refetch";

import { enrollmentService } from "../services/enrollment.service";
import type { EnrollmentFilters } from "../types";

interface TabCounts {
  active: number;
  completed: number;
  cancelled: number;
}

export function useEnrollmentTabCounts(
  filters: Pick<
    EnrollmentFilters,
    "branchId" | "search" | "applicationType"
  >,
) {
  const [counts, setCounts] = useState<TabCounts>({
    active: 0,
    completed: 0,
    cancelled: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchCounts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await enrollmentService.getEnrollmentTabCounts(filters);
      setCounts({
        active: data.active,
        completed: data.completed,
        cancelled: data.cancelled ?? 0,
      });
    } catch {
      setCounts({ active: 0, completed: 0, cancelled: 0 });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void fetchCounts();
  }, [fetchCounts]);

  useRealtimeRefetch("enrollment", fetchCounts);
  useRealtimeRefetch("student", fetchCounts);

  return { counts, isLoading, refetch: fetchCounts };
}
