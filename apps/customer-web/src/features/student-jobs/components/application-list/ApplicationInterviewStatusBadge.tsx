"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import {
  INTERVIEW_STATUS_LABELS,
  type JobApplicationInterviewStatus,
} from "@/src/features/student-jobs/constants";

interface ApplicationInterviewStatusBadgeProps {
  status: JobApplicationInterviewStatus;
}

const STATUS_VARIANTS: Record<
  JobApplicationInterviewStatus,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  NOT_YET: "default",
  INTERVIEW_SCHEDULED: "info",
  INTERVIEWED: "warning",
  SELECTED: "success",
  REJECTED: "danger",
  PLACED: "success",
};

export function ApplicationInterviewStatusBadge({
  status,
}: ApplicationInterviewStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]}>
      {INTERVIEW_STATUS_LABELS[status]}
    </Badge>
  );
}
