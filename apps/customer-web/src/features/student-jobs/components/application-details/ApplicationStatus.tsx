"use client";

import { Card } from "@/src/shared/components/ui/card";

import { ApplicationStatusBadge } from "@/src/features/student-jobs/components/application-list/ApplicationStatusBadge";

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

      <ApplicationStatusBadge
        status={application.status}
      />
    </Card>
  );
}