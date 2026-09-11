"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Hourglass,
  IndianRupee,
  MapPin,
} from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";
import {
  companyInitials,
  employmentLabel,
  experienceLabel,
  formatPostedDate,
  locationLabel,
  salaryLabel,
} from "@/src/features/jobs/utils/job-display.utils";

interface JobHeroProps {
  job: Job;
}

function CompanyLogo({
  name,
  logo,
}: {
  name: string;
  logo: string | null;
}) {
  const initials = companyInitials(name);

  if (logo) {
    return (
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white sm:h-16 sm:w-16">
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain p-2"
          sizes="64px"
        />
      </div>
    );
  }

  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-base font-bold text-[#2563D9] sm:h-16 sm:w-16">
      {initials || "CO"}
    </div>
  );
}

function MetaItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MapPin;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm text-slate-600">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
      <div>
        <span className="sr-only">{label}</span>
        <span className="font-medium text-slate-800">{value}</span>
      </div>
    </div>
  );
}

export function JobHero({ job }: JobHeroProps) {
  const router = useRouter();
  const accepting = isJobAcceptingApplications(job);

  return (
    <section className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-500 sm:text-sm"
        >
          <Link href="/" className="transition-colors hover:text-[#2563D9]">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/jobs" className="transition-colors hover:text-[#2563D9]">
            Jobs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="font-medium text-slate-800">{job.title}</span>
        </nav>

        <Link
          href="/jobs"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-[#2563D9]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="flex flex-col gap-5 pb-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-[28px]">
              {job.title}
            </h1>

            <p className="mt-1 text-base font-semibold text-slate-700 sm:text-lg">
              {job.companyName}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 sm:text-sm">
              {job.jobNumber ? (
                <span className="font-medium text-[#2563D9]">
                  {job.jobNumber}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                Posted {formatPostedDate(job.createdAt)}
              </span>
              {!accepting ? (
                <span className="rounded bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700">
                  Applications closed
                </span>
              ) : null}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5 sm:gap-y-2">
              <MetaItem
                icon={MapPin}
                label="Location"
                value={locationLabel(job)}
              />
              <MetaItem
                icon={Hourglass}
                label="Experience"
                value={experienceLabel(job)}
              />
              <MetaItem
                icon={Briefcase}
                label="Employment type"
                value={employmentLabel(job)}
              />
              <MetaItem
                icon={IndianRupee}
                label="Salary"
                value={salaryLabel(job)}
              />
            </div>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-3 lg:min-w-[200px]">
            <CompanyLogo name={job.companyName} logo={job.companyLogo} />

            {accepting ? (
              <Button
                size="lg"
                className="hidden h-11 w-full min-w-[180px] rounded-lg bg-gradient-to-r from-[#2563D9] to-[#1746A2] text-sm font-semibold text-white hover:from-[#1E58C7] hover:to-[#123D94] lg:inline-flex"
                onClick={() => router.push(`/jobs/${job.slug}/apply`)}
              >
                Apply Now
              </Button>
            ) : (
              <p className="hidden rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800 lg:block">
                Not accepting applications
              </p>
            )}
          </div>
        </div>

        {accepting ? (
          <Button
            size="lg"
            className="mb-1 h-11 w-full rounded-lg bg-gradient-to-r from-[#2563D9] to-[#1746A2] text-sm font-semibold text-white hover:from-[#1E58C7] hover:to-[#123D94] lg:hidden"
            onClick={() => router.push(`/jobs/${job.slug}/apply`)}
          >
            Apply Now
          </Button>
        ) : (
          <p className="mb-1 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-sm text-amber-800 lg:hidden">
            This position is no longer accepting applications.
          </p>
        )}
      </div>
    </section>
  );
}
