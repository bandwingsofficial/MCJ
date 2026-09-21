"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type {
  JobApplicationInterviewStatus,
  JobApplicationStatus,
} from "@/src/features/job-applications/types/job-application.types";
import {
  getOnboardingStatusLabel,
  isLegacyShortlistedSelected,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationStatusBadgeProps {
  status: JobApplicationStatus;
  interviewStatus?: JobApplicationInterviewStatus | string | null;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function JobApplicationStatusBadge({
  status,
  interviewStatus,
}: JobApplicationStatusBadgeProps) {
  const displayAsShortlisted =
    status === "SHORTLISTED" ||
    status === "INTERVIEW" ||
    status === "ASSESSMENT" ||
    isLegacyShortlistedSelected(status, interviewStatus);

  const variant = displayAsShortlisted
    ? "info"
    : status === "REJECTED"
      ? "danger"
      : status === "SELECTED" || status === "PLACED"
        ? "success"
        : status === "APPLIED" || status === "UNDER_REVIEW"
          ? "default"
          : "warning";

  return (
    <Badge variant={variant} className={compactClass}>
      {getOnboardingStatusLabel(status, interviewStatus)}
    </Badge>
  );
}
