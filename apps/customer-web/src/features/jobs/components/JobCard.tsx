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
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-gradient-to-br from-blue-50 to-slate-50 text-sm font-semibold text-[#2563D9] shadow-sm">
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
          className="rounded-xl bg-gradient-to-r from-[#2563D9] to-[#1746A2] font-medium text-white hover:from-[#1E58C7] hover:to-[#123D94]"
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
  const skills = job.skills.slice(0, 4);
  const hiddenSkillCount = Math.max(job.skills.length - skills.length, 0);

  return (
    <Card className="group flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 space-y-1">
            {job.jobNumber ? (
              <p className="text-[11px] font-semibold uppercase tracking-wide text-[#2563D9]">
                {job.jobNumber}
              </p>
            ) : null}
            <h3 className="line-clamp-2 text-base font-bold leading-snug text-slate-900 transition-colors group-hover:text-[#2563D9] sm:text-lg">
              {job.title}
            </h3>
            <p className="text-sm text-slate-600">
              <span className="font-medium text-slate-700">
                {job.companyName}
              </span>
              <span className="text-slate-400"> · </span>
              <span className="text-slate-500">
                Posted by {job.companyName}
              </span>
            </p>
          </div>

          <CompanyAvatar name={job.companyName} logo={job.companyLogo} />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-600 sm:text-sm">
          <span className="inline-flex items-center gap-1.5 font-medium">
            <Hourglass className="h-3.5 w-3.5 text-slate-400" />
            {experienceLabel(job)}
          </span>
          <span className="inline-flex items-center gap-1.5 font-medium">
            <IndianRupee className="h-3.5 w-3.5 text-slate-400" />
            {salaryLabel(job)}
          </span>
          <span className="inline-flex min-w-0 items-center gap-1.5 font-medium">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{locationLabel(job)}</span>
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

        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-9 rounded-lg border-slate-200 text-xs font-semibold sm:text-sm"
            onClick={() => router.push(`/jobs/${job.slug}`)}
          >
            View Job
          </Button>
          <Button
            size="sm"
            className="h-9 rounded-lg bg-gradient-to-r from-[#2563D9] to-[#1746A2] text-xs font-semibold text-white hover:from-[#1E58C7] hover:to-[#123D94] sm:text-sm"
            disabled={!accepting}
            onClick={() => router.push(`/jobs/${job.slug}/apply`)}
          >
            Apply Now
          </Button>
        </div>

        <div className="mt-auto border-t border-slate-100 pt-3">
          <p className="text-xs font-medium text-slate-500">
            Posted {formatPostedDate(job.createdAt)}
          </p>
        </div>
      </div>
    </Card>
  );
}

export function JobCard({ job, variant = "default" }: JobCardProps) {
  if (variant === "listing") {
    return <ListingJobCard job={job} />;
  }

  return <DefaultJobCard job={job} />;
}
