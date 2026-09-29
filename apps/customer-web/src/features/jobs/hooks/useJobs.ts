"use client";

import { useCallback, useEffect, useState } from "react";

import { jobService } from "@/src/features/jobs/services/job.service";

import type { EmploymentType, Job } from "@/src/features/jobs/types/job.types";

export type JobListQuery = {
  search?: string;
  employmentType?: EmploymentType;
  filterMinExperience?: number;
  filterMaxExperience?: number;
  skip?: number;
  take?: number;
};

export function useJobs(query: JobListQuery) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const result = await jobService.getJobs(query);
      setJobs(result.jobs);
      setTotal(result.total);
      setError(null);
    } catch (fetchError) {
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : "Failed to fetch jobs",
      );
    } finally {
      setIsLoading(false);
    }
  }, [query]);

  useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    total,
    isLoading,
    error,
    refetch: fetchJobs,
  };
}
