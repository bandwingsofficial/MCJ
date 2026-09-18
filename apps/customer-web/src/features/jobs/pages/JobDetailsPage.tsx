"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Loader } from "@/src/shared/components/ui/loader";

import { JobDetails } from "@/src/features/jobs/components/JobDetails";
import { JobHero } from "@/src/features/jobs/components/JobHero";
import { JobSidebar } from "@/src/features/jobs/components/JobSidebar";
import { useJob } from "@/src/features/jobs/hooks/useJob";

interface JobDetailsPageProps {
  slug: string;
}

export function JobDetailsPage({ slug }: JobDetailsPageProps) {
  const { job, isLoading, error, refetch } = useJob(slug);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center bg-[#F8FBFF]">
        <Loader />
      </div>
    );
  }

  if (error || !job) {
    return (
      <main className="min-h-[60vh] bg-[#F8FBFF]">
        <div className="mx-auto flex max-w-7xl flex-col items-center px-4 py-20 text-center sm:px-6">
          <ErrorState
            title="Job Not Found"
            description={error ?? "Unable to load this job."}
            onRetry={refetch}
          />
          <Link
            href="/jobs"
            className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-[#0B1F3A] transition hover:border-[#2563EB]/30 hover:text-[#2563EB]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pb-10">
      <JobHero job={job} />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-8">
          <div className="order-2 rounded-2xl border border-slate-200/90 bg-white px-4 shadow-[0_2px_12px_rgba(11,31,58,0.04)] sm:px-6 lg:order-1 lg:px-7">
            <JobDetails job={job} />
          </div>

          <div className="order-1 lg:order-2">
            <JobSidebar job={job} />
          </div>
        </div>
      </div>
    </main>
  );
}
