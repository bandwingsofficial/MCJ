"use client";

import { Card } from "@/src/shared/components/ui/card";

import { Separator } from "@/src/shared/components/ui/separator";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobSidebarProps {
  job: Job;
}

export function JobSidebar({
  job,
}: JobSidebarProps) {
  return (
    <Card className="space-y-5 p-6">
      <h2 className="text-lg font-semibold">
        Job Information
      </h2>

      <Separator />

      <div className="space-y-4 text-sm">
        <div>
          <p className="font-medium">
            Salary
          </p>

          <p className="text-muted-foreground">
            {job.salaryCurrency}{" "}
            {job.minSalary.toLocaleString()}
            {" - "}
            {job.maxSalary.toLocaleString()}
          </p>
        </div>

        <div>
          <p className="font-medium">
            Experience
          </p>

          <p className="text-muted-foreground">
            {job.minExperience}-
            {job.maxExperience} Years
          </p>
        </div>

        <div>
          <p className="font-medium">
            Vacancies
          </p>

          <p className="text-muted-foreground">
            {job.vacancies}
          </p>
        </div>

        <div>
          <p className="font-medium">
            Working Days
          </p>

          <p className="text-muted-foreground">
            {job.workingDays.replaceAll(
              "_",
              " ",
            )}
          </p>
        </div>

        <div>
          <p className="font-medium">
            Location
          </p>

          <p className="text-muted-foreground">
            {job.location}
          </p>
        </div>

        <div>
          <p className="font-medium">
            Deadline
          </p>

          <p className="text-muted-foreground">
            {new Date(
              job.applicationDeadline,
            ).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Card>
  );
}