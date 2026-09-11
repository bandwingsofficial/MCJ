"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { JobDetails } from "@/src/features/jobs/components/JobDetails";
import { JobHero } from "@/src/features/jobs/components/JobHero";
import { JobSidebar } from "@/src/features/jobs/components/JobSidebar";
import { useJob } from "@/src/features/jobs/hooks/useJob";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";

interface JobDetailsPageProps {
  slug: string;
}

export function JobDetailsPage({ slug }: JobDetailsPageProps) {
  const router = useRouter();
  const { job, isLoading, error, refetch } = useJob(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-white">
        <Loader />
      </div>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-[60vh] bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6">
          <ErrorState
            title="Job Not Found"
            description={error ?? "Unable to load this job."}
            onRetry={refetch}
          />
          <Link
            href="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#2563D9]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  const accepting = isJobAcceptingApplications(job);

  return (
    <main className="min-h-screen bg-slate-50/50 pb-24 lg:pb-10">
      <JobHero job={job} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,3fr)] lg:gap-8">
          <div className="rounded-lg border border-slate-200 bg-white px-4 sm:px-6 lg:px-7">
            <JobDetails job={job} />
          </div>

          <JobSidebar job={job} />
        </div>
      </div>

      {accepting ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white p-3 shadow-[0_-4px_16px_rgba(15,23,42,0.08)] lg:hidden">
          <Button
            size="lg"
            className="h-11 w-full rounded-lg bg-gradient-to-r from-[#2563D9] to-[#1746A2] text-sm font-semibold text-white"
            onClick={() => router.push(`/jobs/${job.slug}/apply`)}
          >
            Apply Now
          </Button>
        </div>
      ) : null}
    </main>
  );
}
