"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import { Card } from "@/src/shared/components/ui/card";

import { Separator } from "@/src/shared/components/ui/separator";

import type {
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobDetailsProps {
  job: Job;
}

export function JobDetails({
  job,
}: JobDetailsProps) {
  return (
    <div className="space-y-6">
      <Card className="space-y-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Job Description
        </h2>

        <Separator />

        <p className="leading-7 text-muted-foreground whitespace-pre-wrap">
          {job.description}
        </p>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Responsibilities
        </h2>

        <Separator />

        <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
          {job.responsibilities.map(
            (
              responsibility,
            ) => (
              <li
                key={
                  responsibility
                }
                className="leading-6"
              >
                {
                  responsibility
                }
              </li>
            ),
          )}
        </ul>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Skills
        </h2>

        <Separator />

        <div className="flex flex-wrap gap-2">
          {job.skills.map(
            (skill) => (
              <Badge
                key={skill}
                className="px-3 py-1 text-xs font-medium"
              >
                {skill}
              </Badge>
            ),
          )}
        </div>
      </Card>

      <Card className="space-y-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">
          Interview Process
        </h2>

        <Separator />

        <div className="relative border-l-2 border-muted pl-6 space-y-6 ml-2">
          {job.interviewProcess.map(
            (
              round,
              index,
            ) => (
              <div
                key={index}
                className="relative"
              >
                {/* Timeline node tracker */}
                <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-background border-2 border-primary ring-4 ring-background" />
                
                <div className="rounded-lg border bg-card p-4 shadow-sm transition-colors hover:bg-accent/10">
                  <h3 className="font-semibold text-foreground flex items-center gap-2">
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-mono">
                      Round {index + 1}
                    </span>
                    {round.title}
                  </h3>

                  <p className="mt-2 text-sm text-muted-foreground leading-6">
                    {
                      round.description
                    }
                  </p>
                </div>
              </div>
            ),
          )}
        </div>
      </Card>
    </div>
  );
}