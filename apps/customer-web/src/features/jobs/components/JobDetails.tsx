"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";
import { Separator } from "@/src/shared/components/ui/separator";

import type { Job } from "@/src/features/jobs/types/job.types";
import { isJobAcceptingApplications } from "@/src/features/jobs/types/job.types";

interface JobDetailsProps {
  job: Job;
}

export function JobDetails({ job }: JobDetailsProps) {
  const accepting = isJobAcceptingApplications(job);

  return (
    <div className="space-y-6">
      {!accepting ? (
        <Card className="border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          This position is no longer accepting applications.
        </Card>
      ) : null}

      <Card className="space-y-5 p-6">
        <h2 className="text-xl font-semibold text-foreground">Job Description</h2>
        <Separator />
        <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
          {job.description || "No description provided."}
        </p>
      </Card>

      {job.responsibilities?.length ? (
        <Card className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Responsibilities
          </h2>
          <Separator />
          <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
            {job.responsibilities.map((item) => (
              <li key={item} className="leading-6">
                {item}
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {job.skills?.length ? (
        <Card className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Required Skills
          </h2>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <Badge key={skill} className="px-3 py-1 text-xs font-medium">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}

      {job.preferredSkills?.length ? (
        <Card className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Preferred Skills
          </h2>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {job.preferredSkills.map((skill) => (
              <Badge key={skill} className="px-3 py-1 text-xs font-medium">
                {skill}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}

      {job.qualifications?.length ? (
        <Card className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Minimum Qualification
          </h2>
          <Separator />
          <div className="flex flex-wrap gap-2">
            {job.qualifications.map((item) => (
              <Badge key={item} className="px-3 py-1 text-xs font-medium">
                {item}
              </Badge>
            ))}
          </div>
        </Card>
      ) : null}

      {job.benefits ? (
        <Card className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-foreground">Benefits</h2>
          <Separator />
          <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
            {job.benefits}
          </p>
        </Card>
      ) : null}

      {job.interviewProcess?.length ? (
        <Card className="space-y-5 p-6">
          <h2 className="text-xl font-semibold text-foreground">
            Interview Process
          </h2>
          <Separator />
          <div className="relative ml-2 space-y-6 border-l-2 border-muted pl-6">
            {job.interviewProcess.map((round, index) => (
              <div key={`${round.title}-${index}`} className="relative">
                <span className="absolute -left-[31px] top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-primary bg-background ring-4 ring-background" />
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <h3 className="flex items-center gap-2 font-semibold text-foreground">
                    <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                      Round {index + 1}
                    </span>
                    {round.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {round.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
