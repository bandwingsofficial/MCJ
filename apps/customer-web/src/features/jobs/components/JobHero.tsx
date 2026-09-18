"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Briefcase,
  CalendarDays,
  ChevronRight,
  Hourglass,
  IndianRupee,
  MapPin,
} from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";

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
      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/80 bg-white shadow-sm sm:h-16 sm:w-16">
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
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-[#BFDBFE] bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] text-base font-bold text-[#2563EB] shadow-sm sm:h-16 sm:w-16">
      {initials || "CO"}
    </div>
  );
}

function MetaChip({
  icon: Icon,
  value,
}: {
  icon: typeof MapPin;
  value: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200/90 bg-white/90 px-2.5 py-1.5 text-xs font-medium text-slate-700 shadow-sm sm:text-sm">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#2563EB]" />
      {value}
    </span>
  );
}

export function JobHero({ job }: JobHeroProps) {
  const accepting = isJobAcceptingApplications(job);

  return (
    <section className="relative overflow-hidden border-b border-slate-100 bg-[#F8FBFF]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-[#EFF6FF] to-transparent" />
      <div className="pointer-events-none absolute -right-16 top-0 h-48 w-48 rounded-full bg-[#E0E7FF]/45 blur-3xl" />
      <div className="pointer-events-none absolute bottom-0 left-1/4 h-36 w-36 rounded-full bg-[#EDE9FE]/35 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-7">
        <nav
          aria-label="Breadcrumb"
          className="mb-3 flex flex-wrap items-center gap-1 text-xs text-slate-500"
        >
          <Link href="/" className="transition-colors hover:text-[#2563EB]">
            Home
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/jobs" className="transition-colors hover:text-[#2563EB]">
            Jobs
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="line-clamp-1 font-medium text-[#0B1F3A]">
            {job.title}
          </span>
        </nav>

        <Link
          href="/jobs"
          className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-600 transition-colors hover:text-[#2563EB]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Jobs
        </Link>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between lg:gap-8">
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-3 sm:gap-4">
              <CompanyLogo name={job.companyName} logo={job.companyLogo} />
              <div className="min-w-0">
                <h1 className="text-2xl font-bold tracking-tight text-[#0B1F3A] sm:text-[1.75rem]">
                  {job.title}
                </h1>
                <p className="mt-1 text-base font-semibold text-slate-600">
                  {job.companyName}
                </p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500 sm:text-sm">
              {job.jobNumber ? (
                <span className="font-semibold text-[#2563EB]">
                  {job.jobNumber}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5 font-medium">
                <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                Posted {formatPostedDate(job.createdAt)}
              </span>
              <Badge
                variant={accepting ? "success" : "default"}
                className="rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
              >
                {accepting ? "Open" : "Applications closed"}
              </Badge>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <MetaChip icon={MapPin} value={locationLabel(job)} />
              <MetaChip icon={Hourglass} value={experienceLabel(job)} />
              <MetaChip icon={Briefcase} value={employmentLabel(job)} />
              <MetaChip icon={IndianRupee} value={salaryLabel(job)} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
