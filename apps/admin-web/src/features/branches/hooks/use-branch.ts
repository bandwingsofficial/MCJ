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

  refetch: () => Promise<Branch | null>;

  /** Replace local detail cache after a successful mutation. */
  setBranchData: (branch: Branch | null) => void;
}

export const useBranch = (
  id?: string
): UseBranchReturn => {
  const [branch, setBranch] =
    useState<Branch | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const fetchBranch = useCallback(async () => {
    if (!id) {
      setBranch(null);
      setError(null);
      setIsLoading(false);
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response =
        await branchService.getBranch(id);

      setBranch(response.data);
      return response.data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to load branch";

      setError(message);
      setBranch(null);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // Drop stale detail immediately when switching/clearing selection.
    setBranch(null);
    setError(null);

    if (!id) {
      setIsLoading(false);
      return;
    }

    void fetchBranch();
  }, [id, fetchBranch]);

  return {
    branch,
    isLoading,
    error,
    refetch: fetchBranch,
    setBranchData: setBranch,
  };
};
