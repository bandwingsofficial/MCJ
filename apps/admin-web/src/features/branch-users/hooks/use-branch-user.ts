"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

import { BranchUserDetails } from "@/src/features/branch-users/types/branch-user.types";

interface UseBranchUserReturn {
  branchUser: BranchUserDetails | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export const useBranchUser = (
  id?: string
): UseBranchUserReturn => {
  const [
    branchUser,
    setBranchUser,
  ] =
    useState<BranchUserDetails | null>(
      null
    );

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchBranchUser =
    useCallback(async () => {
      if (!id) {
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);

        setError(null);

        const response =
          await branchUserService.getBranchUser(
            id
          );

        setBranchUser(
          response.data
        );
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch branch user";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [id]);

  useEffect(() => {
    void fetchBranchUser();
  }, [fetchBranchUser]);

  return {
    branchUser,
    isLoading,
    error,
    refetch:
      fetchBranchUser,
  };
};