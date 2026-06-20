"use client";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Skeleton } from "@/src/shared/components/ui/skeleton";

import { JobCard } from "@/src/features/jobs/components/JobCard";
import { JobEmpty } from "@/src/features/jobs/components/JobEmpty";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobGridProps {
  jobs: Job[];

  isLoading: boolean;

  error: string | null;

  onRetry: () => void;
}

export function JobGrid({
  jobs,
  isLoading,
  error,
  onRetry,
}: JobGridProps) {
  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({
          length: 6,
        }).map((_, index) => (
          <Skeleton
            key={index}
            className="h-72 w-full rounded-xl"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load jobs"
        description={error}
        onRetry={onRetry}
      />
    );
  }

  if (jobs.length === 0) {
    return <JobEmpty />;
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
        />
      ))}
    </div>
  );
}