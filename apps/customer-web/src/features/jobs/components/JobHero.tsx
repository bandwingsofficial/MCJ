"use client";

import { useRouter } from "next/navigation";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";
import { EMPLOYMENT_TYPES, WORK_MODES } from "@/src/features/jobs/constants/job.constants";

interface JobHeroProps {
  job: Job;
}

function salaryLabel(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return null;
  }

  const min = job.minSalary?.toLocaleString("en-IN");
  const max = job.maxSalary?.toLocaleString("en-IN");

  if (min && max && min !== max) {
    return `₹${min} – ₹${max}`;
  }

  return `₹${min ?? max}`;
}

export function JobHero({ job }: JobHeroProps) {
  const router = useRouter();
  const accepting = isJobAcceptingApplications(job);
  const employment =
    EMPLOYMENT_TYPES.find((item) => item.value === job.employmentType)?.label ??
    job.employmentType.replaceAll("_", " ");
  const workMode =
    WORK_MODES.find((item) => item.value === job.workMode)?.label ??
    (job.isRemote ? "Remote" : "On-site");

  return (
    <Card className="space-y-6 p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="success">{accepting ? "Open" : "Closed"}</Badge>
            {job.jobNumber ? <Badge>{job.jobNumber}</Badge> : null}
          </div>

          <h1 className="text-3xl font-bold">{job.title}</h1>
          <p className="text-lg text-muted-foreground">{job.companyName}</p>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>📍 {job.location || job.city || "Location not specified"}</span>
            <span>💼 {employment}</span>
            <span>🖥 {workMode}</span>
            <span>
              ⏳ {job.minExperience ?? 0}
              {job.maxExperience != null ? `-${job.maxExperience}` : ""} Years
            </span>
            {salaryLabel(job) ? <span>💰 {salaryLabel(job)}</span> : null}
          </div>
        </div>

        {accepting ? (
          <Button onClick={() => router.push(`/jobs/${job.slug}/apply`)}>
            Apply Now
          </Button>
        ) : (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Applications Closed
          </div>
        )}
      </div>
    </Card>
  );
}
