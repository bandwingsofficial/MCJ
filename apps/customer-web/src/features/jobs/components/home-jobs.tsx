"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { JobCard } from "@/src/features/jobs/components/JobCard";
import type { Job } from "@/src/features/jobs/types/job.types";

interface HomeJobsProps {
  jobs: Job[];
}

export function HomeJobs({ jobs }: HomeJobsProps) {
  if (!jobs.length) {
    return null;
  }

  return (
    <section className="py-14">
      <div className="mx-auto max-w-7xl px-8">
        {/* Header */}
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
              Career Opportunities
            </span>

            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              Latest Job Openings
            </h2>

            <p className="mt-2 max-w-2xl text-slate-600">
              Explore the latest opportunities from leading companies and
              start building your career today.
            </p>
          </div>

          <Link
            href="/jobs"
            className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[#2563D9] to-[#1746A2] px-5 py-3 text-sm font-semibold text-white transition hover:from-[#1E58C7] hover:to-[#123D94] md:flex"
          >
            View All Jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* Jobs Grid - Updated to 4 columns on large screens */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {jobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
            />
          ))}
        </div>

        {/* Mobile Button */}
        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0B1120] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#16203A]"
          >
            View All Jobs
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}