"use client";

import {
  useEffect,
  useState,
} from "react";

import { jobService } from "@/src/features/jobs/services/job.service";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

export function useJobs() {
  const [jobs, setJobs] =
    useState<Job[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  const fetchJobs =
    async () => {
      try {
        setIsLoading(true);

        const data =
          await jobService.getJobs();

        setJobs(data);

        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch jobs",
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void fetchJobs();
  }, []);

  return {
    jobs,

    isLoading,

    error,

    refetch: fetchJobs,
  };
}