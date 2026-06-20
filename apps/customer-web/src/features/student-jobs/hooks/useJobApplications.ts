"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { studentJobService } from "@/src/features/student-jobs/services";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface UseJobApplicationsReturn {
  applications: JobApplication[];

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export function useJobApplications(): UseJobApplicationsReturn {
  const [
    applications,
    setApplications,
  ] = useState<JobApplication[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const fetchApplications =
    useCallback(async (): Promise<void> => {
      try {
        setIsLoading(true);

        setError(null);

        const data =
          await studentJobService.getMyApplications();

        setApplications(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch job applications.",
        );
      } finally {
        setIsLoading(false);
      }
    }, []);

  useEffect(() => {
    void fetchApplications();
  }, [fetchApplications]);

  return {
    applications,

    isLoading,

    error,

    refetch: fetchApplications,
  };
}