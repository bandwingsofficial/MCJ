"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { branchService } from "@/src/features/branches/services/branch.service";

import {
  BranchFilters,
  BranchListItem,
} from "@/src/features/branches/types/branch.types";

interface UseBranchesReturn {
  branches: BranchListItem[];

  count: number;

  isLoading: boolean;

  error: string | null;

  filters: BranchFilters;

  setFilters: (
    filters: BranchFilters
  ) => void;

  refetch: () => Promise<void>;
}

export const useBranches =
  (): UseBranchesReturn => {
    const [branches, setBranches] =
      useState<BranchListItem[]>([]);

    const [count, setCount] =
      useState(0);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFilters] =
      useState<BranchFilters>({
        status: undefined,
        search: "",
        includeDeleted: false,
      });

    const fetchBranches =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await branchService.getBranches(
              filters
            );

          setBranches(
            response.data.items
          );

          setCount(
            response.data.count
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch branches";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchBranches();
    }, [fetchBranches]);

    return {
      branches,
      count,
      isLoading,
      error,
      filters,
      setFilters,
      refetch: fetchBranches,
    };
  };