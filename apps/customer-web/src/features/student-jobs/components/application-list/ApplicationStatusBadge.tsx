"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import {
  getJobApplicationStatusLabel,
  getJobApplicationStatusVariant,
} from "@/src/features/student-jobs/utils/job-application-status.utils";

interface ApplicationStatusBadgeProps {
  status: string;
  interviewStatus?: string | null;
}

export function ApplicationStatusBadge({
  status,
  interviewStatus,
}: ApplicationStatusBadgeProps) {
  return (
    <Badge variant={getJobApplicationStatusVariant(status, interviewStatus)}>
      {getJobApplicationStatusLabel(status, interviewStatus)}
    </Badge>
  );
}
