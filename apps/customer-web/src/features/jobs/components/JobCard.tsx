"use client";

import { useRouter } from "next/navigation";
import { Briefcase, MapPin, IndianRupee, Hourglass } from "lucide-react";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";
import { EMPLOYMENT_TYPES } from "@/src/features/jobs/constants/job.constants";

interface JobCardProps {
  job: Job;
}

function salaryLabel(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return "—";
  }

  const min = job.minSalary?.toLocaleString("en-IN");
  const max = job.maxSalary?.toLocaleString("en-IN");

  if (min && max && min !== max) {
    return `₹${min} - ₹${max}`;
  }

  return `₹${min ?? max}`;
}

export function JobCard({ job }: JobCardProps) {
  const router = useRouter();
  const accepting = isJobAcceptingApplications(job);
  const employment =
    EMPLOYMENT_TYPES.find((item) => item.value === job.employmentType)?.label ??
    job.employmentType.replaceAll("_", " ");

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
            <span className="truncate font-medium">
              {job.location || job.city || "Location not specified"}
            </span>
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
            <span className="font-medium">
              {job.minExperience ?? 0}
              {job.maxExperience != null ? ` - ${job.maxExperience}` : ""} Years
            </span>
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
