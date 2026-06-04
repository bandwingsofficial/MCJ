"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

import {
  BranchUserFilters,
  BranchUserListItem,
} from "@/src/features/branch-users/types/branch-user.types";

interface UseBranchUsersReturn {
  branchUsers: BranchUserListItem[];

  count: number;

  isLoading: boolean;

  error: string | null;

  filters: BranchUserFilters;

  setFilters: (
    filters: BranchUserFilters
  ) => void;

  refetch: () => Promise<void>;
}

export const useBranchUsers =
  (): UseBranchUsersReturn => {
    const [
      branchUsers,
      setBranchUsers,
    ] = useState<
      BranchUserListItem[]
    >([]);

    const [count, setCount] =
      useState(0);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFilters] =
      useState<BranchUserFilters>({
        search: "",
        includeDeleted: false,
        role: undefined,
        status: undefined,
      });

    const fetchBranchUsers =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await branchUserService.getBranchUsers(
              filters
            );

          setBranchUsers(
            response.data.items
          );

          setCount(
            response.data.count
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch branch users";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchBranchUsers();
    }, [fetchBranchUsers]);

    return {
      branchUsers,
      count,
      isLoading,
      error,
      filters,
      setFilters,
      refetch:
        fetchBranchUsers,
    };
  };