"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { Card } from "@/src/shared/components/ui/card";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface ApplicationHeaderProps {
  application: JobApplication;
}

export function ApplicationHeader({
  application,
}: ApplicationHeaderProps) {
  return (
    <Card className="space-y-4 p-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {application.job.title}
          </h1>

          <p className="text-muted-foreground">
            {application.job.companyName}
          </p>
        </div>

        <Badge>
          {application.job.status}
        </Badge>
      </div>
    </Card>
  );
}