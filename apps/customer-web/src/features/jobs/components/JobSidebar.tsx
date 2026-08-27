"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";

import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";
import { WORK_MODES } from "@/src/features/jobs/constants/job.constants";

interface JobSidebarProps {
  job: Job;
}

export function JobSidebar({ job }: JobSidebarProps) {
  const accepting = isJobAcceptingApplications(job);
  const workMode =
    WORK_MODES.find((item) => item.value === job.workMode)?.label ??
    (job.isRemote ? "Remote" : "On-site");

  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-lg font-semibold">Job Information</h2>
      <Separator />
      <div className="space-y-4 text-sm">
        {job.jobNumber ? (
          <div>
            <p className="font-medium">Job Number</p>
            <p className="text-muted-foreground">{job.jobNumber}</p>
          </div>
        ) : null}
        <div>
          <p className="font-medium">Salary</p>
          <p className="text-muted-foreground">
            {job.minSalary != null
              ? `₹${job.minSalary.toLocaleString("en-IN")}`
              : "—"}
            {job.maxSalary != null
              ? ` - ₹${job.maxSalary.toLocaleString("en-IN")}`
              : ""}
          </p>
        </div>
        <div>
          <p className="font-medium">Experience</p>
          <p className="text-muted-foreground">
            {job.minExperience ?? 0}
            {job.maxExperience != null ? `-${job.maxExperience}` : ""} Years
          </p>
        </div>
        <div>
          <p className="font-medium">Openings</p>
          <p className="text-muted-foreground">{job.vacancies}</p>
        </div>
        <div>
          <p className="font-medium">Work Mode</p>
          <p className="text-muted-foreground">{workMode}</p>
        </div>
        <div>
          <p className="font-medium">Location</p>
          <p className="text-muted-foreground">
            {job.location || job.city || "—"}
          </p>
        </div>
        <div>
          <p className="font-medium">Application Deadline</p>
          <p className="text-muted-foreground">
            {job.applicationDeadline
              ? new Date(job.applicationDeadline).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}
          </p>
        </div>
        <div>
          <p className="font-medium">Applications</p>
          <p className={accepting ? "text-emerald-700" : "text-amber-700"}>
            {accepting ? "Open" : "Applications Closed"}
          </p>
        </div>
      </div>
    </Card>
  );
}
