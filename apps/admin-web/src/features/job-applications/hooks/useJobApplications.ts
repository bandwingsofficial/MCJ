"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_APPLICATION_PAGE_SIZE } from "@/src/features/job-applications/constants/job-application.constants";
import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type {
  JobApplication,
  OnboardingStatusFilter,
} from "@/src/features/job-applications/types/job-application.types";
import { toJobApplicationStatus } from "@/src/features/job-applications/types/job-application.types";

const SEARCH_DEBOUNCE_MS = 400;

export interface JobApplicationFilters {
  search: string;
  status: OnboardingStatusFilter;
  page: number;
  pageSize: number;
}

interface UseJobApplicationsReturn {
  jobApplications: JobApplication[];
  total: number;
  catalogTotal: number;
  pendingCount: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  filters: JobApplicationFilters;
  setFilters: (filters: JobApplicationFilters) => void;
  refetch: () => Promise<void>;
}

export const useJobApplications = (): UseJobApplicationsReturn => {
  const [jobApplications, setJobApplications] = useState<JobApplication[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<JobApplicationFilters>({
    search: "",
    status: "ALL",
    page: 1,
    pageSize: DEFAULT_APPLICATION_PAGE_SIZE,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilters = useCallback((next: JobApplicationFilters) => {
    setFiltersState((prev) => {
      const statusChanged = next.status !== prev.status;
      const pageSizeChanged = next.pageSize !== prev.pageSize;

      return {
        ...next,
        page: statusChanged || pageSizeChanged ? 1 : next.page,
      };
    });
  }, []);

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      const nextSearch = (filters.search ?? "").trim();

      setDebouncedSearch((prev) =>
        prev === nextSearch ? prev : nextSearch,
      );

      setFiltersState((prev) =>
        prev.page === 1 ? prev : { ...prev, page: 1 },
      );
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [filters.search]);

  const fetchJobApplications = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isFirstLoad = !hasLoadedRef.current;

    try {
      if (isFirstLoad) {
        setIsInitialLoading(true);
      } else {
        setIsFetching(true);
      }

      const page = filters.page ?? 1;
      const pageSize = filters.pageSize ?? DEFAULT_APPLICATION_PAGE_SIZE;
      const [response, pending] = await Promise.all([
        jobApplicationService.getJobApplications({
          search: debouncedSearch || undefined,
          status: toJobApplicationStatus(filters.status),
          skip: (page - 1) * pageSize,
          take: pageSize,
        }),
        jobApplicationService.getJobApplications({
          status: "APPLIED",
          skip: 0,
          take: 1,
        }),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setJobApplications(response.items);
      setTotal(response.total);
      setPendingCount(pending.total);

      if (!debouncedSearch && filters.status === "ALL") {
        setCatalogTotal(response.total);
      }

      setError(null);
      hasLoadedRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(
        err instanceof Error
          ? err.message
          : "Failed to fetch job applications",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsFetching(false);
      }
    }
  }, [debouncedSearch, filters.page, filters.pageSize, filters.status]);

  useEffect(() => {
    void fetchJobApplications();
  }, [fetchJobApplications]);

  return {
    jobApplications,
    total,
    catalogTotal,
    pendingCount,
    isInitialLoading,
    isFetching,
    isLoading: isInitialLoading,
    error,
    filters,
    setFilters,
    refetch: fetchJobApplications,
  };
};
