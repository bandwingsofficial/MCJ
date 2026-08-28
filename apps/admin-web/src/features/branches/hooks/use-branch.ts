"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { Branch } from "@/src/features/branches/types/branch.types";

import { branchService } from "@/src/features/branches/services/branch.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

const BRANCH_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    useState(Boolean(id));

  const [error, setError] =
    useState<string | null>(null);

  const fetchBranch = useCallback(async () => {
    if (!id) {
      setBranch(null);
      setError(null);
      setIsLoading(false);
      return null;
    }

    if (!BRANCH_ID_PATTERN.test(id)) {
      setBranch(null);
      setError("This branch does not exist.");
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
      setError(getErrorMessage(err));
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
