"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Branch } from "@/src/features/branches/types/branch.types";

import { branchService } from "@/src/features/branches/services/branch.service";

interface UseBranchReturn {
  branch: Branch | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export const useBranch = (
  id?: string
): UseBranchReturn => {
  const [branch, setBranch] =
    useState<Branch | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchBranch =
    useCallback(async () => {
      if (!id) return;

      try {
        setIsLoading(true);

        setError(null);

        const response =
          await branchService.getBranch(
            id
          );

        setBranch(response.data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to load branch";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [id]);

  useEffect(() => {
    void fetchBranch();
  }, [fetchBranch]);

  return {
    branch,
    isLoading,
    error,
    refetch: fetchBranch,
  };
};