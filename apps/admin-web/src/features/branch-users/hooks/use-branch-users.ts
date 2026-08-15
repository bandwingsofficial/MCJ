"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { branchUserService } from "@/src/features/branch-users/services/branch-user.service";

import {
  BranchUserFilters,
  BranchUserListItem,
} from "@/src/features/branch-users/types/branch-user.types";

const DEFAULT_PAGE_SIZE = 20;
const SEARCH_DEBOUNCE_MS = 400;

interface UseBranchUsersOptions {
  branchId?: string;
}

interface UseBranchUsersReturn {
  branchUsers: BranchUserListItem[];

  count: number;

  isLoading: boolean;

  isInitialLoading: boolean;

  error: string | null;

  filters: BranchUserFilters;

  setFilters: (
    filters: BranchUserFilters
  ) => void;

  refetch: () => Promise<void>;
}

export const useBranchUsers = (
  options: UseBranchUsersOptions = {},
): UseBranchUsersReturn => {
  const { branchId } = options;

  const [
    branchUsers,
    setBranchUsers,
  ] = useState<
    BranchUserListItem[]
  >([]);

  const [count, setCount] =
    useState(0);

  const [isInitialLoading, setIsInitialLoading] =
    useState(true);

  const [isLoading, setIsLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [filters, setFiltersState] =
    useState<BranchUserFilters>({
      branchId,
      search: "",
      role: undefined,
      status: undefined,
      page: 1,
      pageSize: DEFAULT_PAGE_SIZE,
    });

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);

  useEffect(() => {
    setFiltersState((prev) => ({
      ...prev,
      branchId,
      page: 1,
    }));
  }, [branchId]);

  const setFilters = useCallback(
    (next: BranchUserFilters) => {
      setFiltersState((prev) => {
        const shouldResetPage =
          next.search !== prev.search ||
          next.role !== prev.role ||
          next.status !== prev.status ||
          next.pageSize !== prev.pageSize ||
          next.branchId !== prev.branchId;

        return {
          ...next,
          branchId: branchId ?? next.branchId,
          page: shouldResetPage ? 1 : next.page,
        };
      });
    },
    [branchId],
  );

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const nextSearch = filters.search.trim();

      setDebouncedSearch((prev) =>
        prev === nextSearch ? prev : nextSearch
      );

      setFiltersState((prev) =>
        prev.page === 1
          ? prev
          : { ...prev, page: 1 }
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search]);

  const fetchBranchUsers = useCallback(
    async () => {
      const requestId = ++requestIdRef.current;
      const isFirstLoad = !hasLoadedRef.current;

      try {
        if (isFirstLoad) {
          setIsInitialLoading(true);
        } else {
          setIsLoading(true);
        }

        setError(null);

        const response =
          await branchUserService.getBranchUsers({
            ...filters,
            branchId: branchId ?? filters.branchId,
            search: debouncedSearch,
          });

        if (requestId !== requestIdRef.current) {
          return;
        }

        setBranchUsers(
          response.data.items
        );

        setCount(
          response.data.count
        );

        hasLoadedRef.current = true;
      } catch (fetchError) {
        if (requestId !== requestIdRef.current) {
          return;
        }

        const message =
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to fetch users";

        setError(message);
      } finally {
        if (requestId === requestIdRef.current) {
          setIsInitialLoading(false);
          setIsLoading(false);
        }
      }
    },
    [
      branchId,
      debouncedSearch,
      filters.branchId,
      filters.page,
      filters.pageSize,
      filters.role,
      filters.status,
    ],
  );

  useEffect(() => {
    void fetchBranchUsers();
  }, [fetchBranchUsers]);

  return {
    branchUsers,
    count,
    isLoading,
    isInitialLoading,
    error,
    filters,
    setFilters,
    refetch: fetchBranchUsers,
  };
};
