"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Briefcase, Hourglass, IndianRupee, MapPin } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";
import {
  companyInitials,
  descriptionLabel,
  employmentLabel,
  experienceLabel,
  formatPostedDate,
  locationLabel,
  salaryLabel,
} from "@/src/features/jobs/utils/job-display.utils";

interface JobCardProps {
  job: Job;
  variant?: "default" | "listing";
}

function CompanyAvatar({
  name,
  logo,
}: {
  name: string;
  logo: string | null;
}) {
  const initials = companyInitials(name);

  if (logo) {
    return (
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <Image
          src={logo}
          alt={name}
          fill
          className="object-contain p-1.5"
          sizes="48px"
        />
      </div>
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#BFDBFE]/60 bg-gradient-to-br from-[#EFF6FF] to-[#F5F3FF] text-sm font-semibold text-[#2563EB] shadow-sm">
      {initials || "CO"}
    </div>
  );
}

function DefaultJobCard({ job }: { job: Job }) {
  const router = useRouter();
  const accepting = isJobAcceptingApplications(job);
  const employment = employmentLabel(job);

  return (
    <Card className="group flex h-full max-w-sm flex-col justify-between rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            {job.jobNumber ? (
              <p className="text-xs font-semibold uppercase tracking-wide text-[#2563D9]">
                {job.jobNumber}
              </p>
            ) : null}
            <h3 className="line-clamp-2 text-xl font-bold tracking-tight text-slate-900 transition-colors duration-200 group-hover:text-[#2563D9]">
              {job.title}
            </h3>
            <p className="text-sm font-medium text-slate-500">
              {job.companyName}
            </p>
          </div>
          <Badge
            variant={accepting ? "success" : "default"}
            className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold tracking-wide"
          >
            {accepting ? "Open" : "Closed"}
          </Badge>
        </div>

        <div className="my-5 border-t border-slate-100" />

        <div className="grid grid-cols-1 gap-x-2 gap-y-4 text-sm text-slate-600 sm:grid-cols-2">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400">
              <MapPin className="h-4 w-4 shrink-0" />
            </div>
            <span className="truncate font-medium">{locationLabel(job)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400">
              <Briefcase className="h-4 w-4 shrink-0" />
            </div>
            <span className="truncate font-medium">{employment}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400">
              <Hourglass className="h-4 w-4 shrink-0" />
            </div>
            <span className="font-medium">{experienceLabel(job)}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-slate-50 p-1.5 text-slate-400">
              <IndianRupee className="h-4 w-4 shrink-0" />
            </div>
            <span className="font-semibold text-slate-800">
              {salaryLabel(job)}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2 pt-2">
        <Button
          variant="outline"
          className="rounded-xl"
          onClick={() => router.push(`/jobs/${job.slug}`)}
        >
          View Job
        </Button>
        <Button
          className="rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] font-medium text-white hover:from-[#2860D4] hover:to-[#1A3F96]"
          disabled={!accepting}
          onClick={() => router.push(`/jobs/${job.slug}/apply`)}
        >
          Apply Now
        </Button>
      </div>
    </Card>
  );
}

function ListingJobCard({ job }: { job: Job }) {
  const router = useRouter();
  const accepting = isJobAcceptingApplications(job);
  const employment = employmentLabel(job);
  const skills = job.skills.slice(0, 4);
  const hiddenSkillCount = Math.max(job.skills.length - skills.length, 0);

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_2px_12px_rgba(11,31,58,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:border-[#2563EB]/25 hover:shadow-[0_14px_32px_rgba(11,31,58,0.08)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5">
        <CompanyAvatar name={job.companyName} logo={job.companyLogo} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 space-y-1">
              {job.jobNumber ? (
                <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2563EB]">
                  {job.jobNumber}
                </p>
              ) : null}
              <h3 className="line-clamp-2 text-base font-bold leading-snug text-[#0B1F3A] transition-colors group-hover:text-[#2563EB] sm:text-lg">
                {job.title}
              </h3>
              <p className="text-sm font-medium text-slate-600">
                {job.companyName}
              </p>
            </div>

            <Badge
              variant={accepting ? "success" : "default"}
              className="shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold"
            >
              {accepting ? "Open" : "Closed"}
            </Badge>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F8FBFF] px-2.5 py-1 text-xs font-medium text-slate-700">
              <MapPin className="h-3.5 w-3.5 text-[#2563EB]" />
              {locationLabel(job)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F8FBFF] px-2.5 py-1 text-xs font-medium text-slate-700">
              <Briefcase className="h-3.5 w-3.5 text-[#2563EB]" />
              {employment}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-[#F8FBFF] px-2.5 py-1 text-xs font-medium text-slate-700">
              <Hourglass className="h-3.5 w-3.5 text-[#2563EB]" />
              {experienceLabel(job)}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-[#E0E7FF] bg-[#F5F3FF]/70 px-2.5 py-1 text-xs font-semibold text-[#0B1F3A]">
              <IndianRupee className="h-3.5 w-3.5 text-[#7C3AED]" />
              {salaryLabel(job)}
            </span>
          </div>

          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-600">
            {descriptionLabel(job)}
          </p>

          {skills.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-600"
                >
                  {skill}
                </span>
              ))}
              {hiddenSkillCount > 0 ? (
                <span className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-500">
                  +{hiddenSkillCount} more
                </span>
              ) : null}
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 border-t border-slate-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              Posted {formatPostedDate(job.createdAt)}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-9 rounded-xl border-slate-200 px-4 text-xs font-semibold text-[#0B1F3A] sm:text-sm"
                onClick={() => router.push(`/jobs/${job.slug}`)}
              >
                View Job
              </Button>
              <Button
                size="sm"
                className="h-9 rounded-xl bg-gradient-to-r from-[#2F6BE5] to-[#1E49A8] px-4 text-xs font-semibold text-white hover:from-[#2860D4] hover:to-[#1A3F96] sm:text-sm"
                disabled={!accepting}
                onClick={() => router.push(`/jobs/${job.slug}/apply`)}
              >
                Apply Now
              </Button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export function JobCard({ job, variant = "default" }: JobCardProps) {
  if (variant === "listing") {
    return <ListingJobCard job={job} />;
  }

  return <DefaultJobCard job={job} />;
}
