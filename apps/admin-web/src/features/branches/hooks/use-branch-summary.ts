"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { branchService } from "@/src/features/branches/services/branch.service";

export interface BranchSummaryCounts {
  branchId: string;
  students: number;
  courses: number;
  batches: number;
  enrollments: number;
  instructors: number;
  categories: number;
}

export function useBranchSummary(branchId?: string) {
  const [summary, setSummary] =
    useState<BranchSummaryCounts | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!branchId) {
      setSummary(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const response =
        await branchService.getBranchSummary(branchId);
      setSummary(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load branch summary"
      );
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return { summary, isLoading, error, refetch };
}
