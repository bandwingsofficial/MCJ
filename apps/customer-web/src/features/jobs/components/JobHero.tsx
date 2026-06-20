"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobHeroProps {
  job: Job;
}

export function JobHero({
  job,
}: JobHeroProps) {
  return (
    <Card className="space-y-6 p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="space-y-3">
          <Badge variant="success">
            {job.status}
          </Badge>

          <h1 className="text-3xl font-bold">
            {job.title}
          </h1>

          <p className="text-lg text-muted-foreground">
            {job.companyName}
          </p>

          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span>
              📍 {job.city},{" "}
              {job.state}
            </span>

            <span>
              💼{" "}
              {job.employmentType.replaceAll(
                "_",
                " ",
              )}
            </span>

            <span>
              ⏳{" "}
              {job.minExperience}-
              {job.maxExperience} Years
            </span>
          </div>
        </div>

        <Button>
          Apply Now
        </Button>
      </div>
    </Card>
  );
}