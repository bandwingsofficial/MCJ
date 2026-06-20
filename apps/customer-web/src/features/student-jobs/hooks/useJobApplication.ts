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

interface UseJobApplicationReturn {
  application: JobApplication | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export function useJobApplication(
  applicationId: string,
): UseJobApplicationReturn {
  const [
    application,
    setApplication,
  ] = useState<JobApplication | null>(
    null,
  );

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const fetchApplication =
    useCallback(async (): Promise<void> => {
      if (!applicationId) {
        setApplication(null);
        setError(
          "Application ID is required.",
        );
        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);

        setError(null);

        const data =
          await studentJobService.getMyApplication(
            applicationId,
          );

        setApplication(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch application.",
        );
      } finally {
        setIsLoading(false);
      }
    }, [applicationId]);

  useEffect(() => {
    void fetchApplication();
  }, [fetchApplication]);

  return {
    application,

    isLoading,

    error,

    refetch: fetchApplication,
  };
}