"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { DEFAULT_JOB_PAGE_SIZE } from "@/src/features/jobs/constants/job.constants";
import { jobService } from "@/src/features/jobs/services/job.service";
import type {
  Job,
  JobFilters,
  JobLifecycleStatus,
  JobListQuery,
  JobOnboardingFilters,
  JobOnboardingStatusFilter,
  JobStatus,
} from "@/src/features/jobs/types/job.types";

const SEARCH_DEBOUNCE_MS = 400;

function hasActiveJobFilters(filters: JobFilters): boolean {
  return Boolean((filters.search ?? "").trim() || filters.status);
}

function toCatalogQuery(filters: JobFilters, search: string): JobListQuery {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? DEFAULT_JOB_PAGE_SIZE;
  const skip = (page - 1) * pageSize;
  const status = filters.status;

  const query: JobListQuery = {
    search: search || undefined,
    skip,
    take: pageSize,
    catalogOnly: true,
  };

  if (status === "ACTIVE") {
    query.isActive = true;
  } else if (status === "INACTIVE") {
    query.isActive = false;
  } else if (status === "ARCHIVED") {
    query.onlyDeleted = true;
  }

  return query;
}

function toOnboardingStatus(
  filter: JobOnboardingStatusFilter,
): JobStatus | undefined {
  if (filter === "PENDING") {
    return "PENDING_APPROVAL";
  }

  if (filter === "ACCEPTED") {
    return "ACTIVE";
  }

  if (filter === "REJECTED") {
    return "REJECTED";
  }

  return undefined;
}

interface UseJobsReturn {
  jobs: Job[];
  total: number;
  catalogTotal: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  isLoading: boolean;
  error: string | null;
  filters: JobFilters;
  setFilters: (filters: JobFilters) => void;
  refetch: () => Promise<void>;
}

export const useJobs = (): UseJobsReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<JobFilters>({
    search: "",
    status: undefined,
    page: 1,
    pageSize: DEFAULT_JOB_PAGE_SIZE,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilters = useCallback((next: JobFilters) => {
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

  const fetchJobs = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isFirstLoad = !hasLoadedRef.current;

    try {
      if (isFirstLoad) {
        setIsInitialLoading(true);
      } else {
        setIsFetching(true);
      }

      const response = await jobService.getJobs(
        toCatalogQuery(filters, debouncedSearch),
      );

      if (requestId !== requestIdRef.current) {
        return;
      }

      setJobs(response.items);
      setTotal(response.total);

      if (!hasActiveJobFilters({ ...filters, search: debouncedSearch })) {
        setCatalogTotal(response.total);
      }

      setError(null);
      hasLoadedRef.current = true;
    } catch (err) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setError(err instanceof Error ? err.message : "Failed to fetch jobs");
    } finally {
      if (requestId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsFetching(false);
      }
    }
  }, [debouncedSearch, filters]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    total,
    catalogTotal,
    isInitialLoading,
    isFetching,
    isLoading: isInitialLoading,
    error,
    filters,
    setFilters,
    refetch: fetchJobs,
  };
};

export function getJobLifecycleStatus(job: Job): JobLifecycleStatus {
  if (job.isDeleted) {
    return "ARCHIVED";
  }

  if (!job.isActive) {
    return "INACTIVE";
  }

  return "ACTIVE";
}

interface UseJobOnboardingReturn {
  jobs: Job[];
  total: number;
  catalogTotal: number;
  pendingCount: number;
  isInitialLoading: boolean;
  isFetching: boolean;
  error: string | null;
  filters: JobOnboardingFilters;
  setFilters: (filters: JobOnboardingFilters) => void;
  refetch: () => Promise<void>;
}

export const useJobOnboarding = (): UseJobOnboardingReturn => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [catalogTotal, setCatalogTotal] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFiltersState] = useState<JobOnboardingFilters>({
    search: "",
    status: "ALL",
    page: 1,
    pageSize: DEFAULT_JOB_PAGE_SIZE,
  });
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const hasLoadedRef = useRef(false);
  const requestIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilters = useCallback((next: JobOnboardingFilters) => {
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

  const fetchJobs = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    const isFirstLoad = !hasLoadedRef.current;
    const page = filters.page ?? 1;
    const pageSize = filters.pageSize ?? DEFAULT_JOB_PAGE_SIZE;

    try {
      if (isFirstLoad) {
        setIsInitialLoading(true);
      } else {
        setIsFetching(true);
      }

      const [response, pending] = await Promise.all([
        jobService.getJobs({
          search: debouncedSearch || undefined,
          skip: (page - 1) * pageSize,
          take: pageSize,
          source: "COMPANY_ONBOARDING",
          status: toOnboardingStatus(filters.status),
        }),
        jobService.getJobs({
          source: "COMPANY_ONBOARDING",
          status: "PENDING_APPROVAL",
          skip: 0,
          take: 1,
        }),
      ]);

      if (requestId !== requestIdRef.current) {
        return;
      }

      setJobs(response.items);
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
        err instanceof Error ? err.message : "Failed to fetch submissions",
      );
    } finally {
      if (requestId === requestIdRef.current) {
        setIsInitialLoading(false);
        setIsFetching(false);
      }
    }
  }, [debouncedSearch, filters.page, filters.pageSize, filters.status]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    total,
    catalogTotal,
    pendingCount,
    isInitialLoading,
    isFetching,
    error,
    filters,
    setFilters,
    refetch: fetchJobs,
  };
};
