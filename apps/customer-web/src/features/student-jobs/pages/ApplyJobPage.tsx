"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { appToast } from "@/src/shared/components/ui/toast";

import { JobApplicationForm } from "@/src/features/student-jobs/components/application-form";

import { useApplyJob } from "@/src/features/student-jobs/hooks";

import { jobService } from "@/src/features/jobs/services/job.service";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

import type {
  ApplyJobSchema,
} from "@/src/features/student-jobs/schemas";

interface ApplyJobPageProps {
  jobSlug: string;

  jobId: string;
}

export function ApplyJobPage({
  jobSlug,
  jobId,
}: ApplyJobPageProps) {
  const router = useRouter();

  const [job, setJob] =
    useState<Job | null>(null);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState<string | null>(null);

  const {
    applyJob,
    isSubmitting,
  } = useApplyJob();

  useEffect(() => {
    const fetchJob = async () => {
      try {
        setIsLoading(true);

        const response =
          await jobService.getJob(jobSlug);

        setJob(response);

        setError(null);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load job.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void fetchJob();
  }, [jobSlug]);

  const handleSubmit =
    async (
      values: ApplyJobSchema,
    ) => {
        console.log("========== APPLY DEBUG ==========");
    console.log("jobSlug:", jobSlug);
    console.log("jobId prop:", jobId);
    console.log("Fetched Job:", job);
    console.log("Fetched Job ID:", job?.id);
    console.log("================================");
      const response =
       await applyJob(
  job!.id,
  values,
);

      if (!response) {
        appToast.error(
          "Unable to submit application.",
        );

        return;
      }

      appToast.success(
        "Application submitted successfully.",
      );

      router.push(
        "/student/applications",
      );
    };

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-md mx-auto py-2 px-1">
        <ErrorState
          title="Unable to load job"
          description={
            error ??
            "Job not found."
          }
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto px-1 py-2 md:py-8 space-y-6">
      <div className="border-b border-slate-100 pb-1">
        <PageHeader
          title={job.title}
          description={
            job.companyName
          }
        />
      </div>

      <div className="bg-white rounded-xl">
        <JobApplicationForm
          isSubmitting={
            isSubmitting
          }
          onSubmit={
            handleSubmit
          }
        />
      </div>
    </div>
  );
}