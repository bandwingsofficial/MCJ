"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { jobService } from "@/src/features/jobs/services/job.service";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

export interface JobFilters {
  search: string;

  includeDeleted: boolean;
}

interface UseJobsReturn {
  jobs: Job[];

  isLoading: boolean;

  error: string | null;

  filters: JobFilters;

  setFilters: (
    filters: JobFilters,
  ) => void;

  refetch: () => Promise<void>;
}

export const useJobs =
  (): UseJobsReturn => {
    const [jobs, setJobs] =
      useState<Job[]>([]);

    const [isLoading, setIsLoading] =
      useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFilters] =
      useState<JobFilters>({
        search: "",

        includeDeleted: false,
      });

    const fetchJobs =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await jobService.getJobs();

          setJobs(response.data);
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch jobs";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchJobs();
    }, [fetchJobs]);

    return {
      jobs,

      isLoading,

      error,

      filters,

      setFilters,

      refetch: fetchJobs,
    };
  };