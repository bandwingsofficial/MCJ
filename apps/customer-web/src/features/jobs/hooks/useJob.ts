"use client";

import {
  useEffect,
  useState,
} from "react";

import { jobService } from "@/src/features/jobs/services/job.service";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

export function useJob(
  slug: string,
) {
  const [job, setJob] =
    useState<Job | null>(
      null,
    );

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

  const fetchJob =
    async () => {
      if (!slug) {
        return;
      }

      try {
        setIsLoading(true);

        const data =
          await jobService.getJob(
            slug,
          );

        setJob(data);

        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to fetch job",
        );
      } finally {
        setIsLoading(false);
      }
    };

  useEffect(() => {
    void fetchJob();
  }, [slug]);

  return {
    job,

    isLoading,

    error,

    refetch: fetchJob,
  };
}