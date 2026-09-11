"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import {
  getJobApplicationStatusLabel,
  getJobApplicationStatusVariant,
} from "@/src/features/student-jobs/utils/job-application-status.utils";

interface ApplicationStatusBadgeProps {
  status: string;
}

export function ApplicationStatusBadge({
  status,
}: ApplicationStatusBadgeProps) {
  return (
    <Badge variant={getJobApplicationStatusVariant(status)}>
      {getJobApplicationStatusLabel(status)}
    </Badge>
  );
}