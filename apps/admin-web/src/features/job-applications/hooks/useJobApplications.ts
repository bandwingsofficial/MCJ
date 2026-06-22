"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";

import type {
  JobApplication,
} from "@/src/features/job-applications/types/job-application.types";

export interface JobApplicationFilters {
  search: string;

  includeDeleted: boolean;
}

interface UseJobApplicationsReturn {
  jobApplications: JobApplication[];

  isLoading: boolean;

  error: string | null;

  filters: JobApplicationFilters;

  setFilters: (
    filters: JobApplicationFilters,
  ) => void;

  refetch: () => Promise<void>;
}

export const useJobApplications =
  (): UseJobApplicationsReturn => {
    const [
      jobApplications,
      setJobApplications,
    ] = useState<JobApplication[]>([]);

    const [
      isLoading,
      setIsLoading,
    ] = useState(true);

    const [error, setError] =
      useState<string | null>(null);

    const [filters, setFilters] =
      useState<JobApplicationFilters>({
        search: "",
        includeDeleted: false,
      });

    const fetchJobApplications =
      useCallback(async () => {
        try {
          setIsLoading(true);

          setError(null);

          const response =
            await jobApplicationService.getJobApplications();

          setJobApplications(
            response.data,
          );
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Failed to fetch job applications";

          setError(message);
        } finally {
          setIsLoading(false);
        }
      }, [filters]);

    useEffect(() => {
      void fetchJobApplications();
    }, [fetchJobApplications]);

    return {
      jobApplications,

      isLoading,

      error,

      filters,

      setFilters,

      refetch:
        fetchJobApplications,
    };
  };