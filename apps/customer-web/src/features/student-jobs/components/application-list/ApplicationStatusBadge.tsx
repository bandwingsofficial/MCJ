"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import {
  APPLICATION_STATUS_LABELS,
} from "@/src/features/student-jobs/constants";

import type {
  ApplicationStatus,
} from "@/src/features/student-jobs/types";

interface ApplicationStatusBadgeProps {
  status: ApplicationStatus;
}

const STATUS_VARIANTS: Record<
  ApplicationStatus,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  APPLIED: "info",

  UNDER_REVIEW: "warning",

  SHORTLISTED: "warning",

  INTERVIEW_SCHEDULED: "info",

  INTERVIEWED: "info",

  SELECTED: "success",

  HIRED: "success",

  REJECTED: "danger",

  WITHDRAWN: "default",
};

export function ApplicationStatusBadge({
  status,
}: ApplicationStatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
    >
      {APPLICATION_STATUS_LABELS[status]}
    </Badge>
  );
}