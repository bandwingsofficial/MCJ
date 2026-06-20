"use client";

import { useJob } from "@/src/features/jobs/hooks/useJob";

import { JobHero } from "@/src/features/jobs/components/JobHero";
import { JobDetails } from "@/src/features/jobs/components/JobDetails";
import { JobSidebar } from "@/src/features/jobs/components/JobSidebar";

import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";

interface JobDetailsPageProps {
  slug: string;
}

export function JobDetailsPage({
  slug,
}: JobDetailsPageProps) {
  const {
    job,
    isLoading,
    error,
    refetch,
  } = useJob(slug);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Loader />
      </div>
    );
  }

  if (error || !job) {
    return (
      <ErrorState
        title="Job Not Found"
        description={
          error ??
          "Unable to load this job."
        }
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="container mx-auto space-y-8 py-10">
      <JobHero job={job} />

      <div className="grid gap-8 lg:grid-cols-[1fr_350px]">
        <JobDetails job={job} />

        <JobSidebar job={job} />
      </div>
    </div>
  );
}