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

interface UseJobReturn {
  job: Job | null;

  isLoading: boolean;

  error: string | null;

  refetch: () => Promise<void>;
}

export const useJob = (
  id: string,
): UseJobReturn => {
  const [job, setJob] =
    useState<Job | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const fetchJob =
    useCallback(async () => {
      if (!id) {
        return;
      }

      try {
        setIsLoading(true);

        setError(null);

        const response =
          await jobService.getJob(id);

        setJob(response.data);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to fetch job";

        setError(message);
      } finally {
        setIsLoading(false);
      }
    }, [id]);

  useEffect(() => {
    void fetchJob();
  }, [fetchJob]);

  return {
    job,

    isLoading,

    error,

    refetch: fetchJob,
  };
};