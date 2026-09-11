"use client";

import { Card } from "@/src/shared/components/ui/card";

import { ApplicationStatusBadge } from "@/src/features/student-jobs/components/application-list/ApplicationStatusBadge";
import { ApplicationInterviewStatusBadge } from "@/src/features/student-jobs/components/application-list/ApplicationInterviewStatusBadge";

import type {
  JobApplication,
} from "@/src/features/student-jobs/types";

interface ApplicationStatusProps {
  application: JobApplication;
}

export function ApplicationStatus({
  application,
}: ApplicationStatusProps) {
  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-lg font-semibold">
        Application Status
      </h2>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Application Status
          </p>
          <div className="mt-1">
            <ApplicationStatusBadge
              status={application.status}
            />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-muted-foreground">
            Interview Status
          </p>
          <div className="mt-1">
            <ApplicationInterviewStatusBadge
              status={application.interviewStatus ?? "NOT_YET"}
            />
          </div>
        </div>
      </div>
    </Card>
  );
}