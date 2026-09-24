"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  formatScheduledRoundLabel,
  pickCurrentScheduledInterview,
  resolveApplicationInterviewDisplay,
} from "@/src/features/job-applications/types/job-application.types";
import { formatInterviewDateTimeLabel } from "@/src/features/job-applications/utils/interview-schedule.utils";

interface JobApplicationInterviewStatusBadgeProps {
  application: JobApplication;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function JobApplicationInterviewStatusBadge({
  application,
}: JobApplicationInterviewStatusBadgeProps) {
  const display = resolveApplicationInterviewDisplay(application);
  const scheduledInterview =
    display.key === "SCHEDULED"
      ? pickCurrentScheduledInterview(application)
      : null;
  const roundLabel = scheduledInterview
    ? formatScheduledRoundLabel(scheduledInterview)
    : null;
  const scheduledAtLabel = scheduledInterview
    ? formatInterviewDateTimeLabel(scheduledInterview.scheduledAt)
    : null;

  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <Badge variant={display.variant} className={compactClass}>
        {display.label}
      </Badge>
      {roundLabel ? (
        <p className="text-xs leading-snug text-[#102A56]">{roundLabel}</p>
      ) : null}
      {scheduledAtLabel ? (
        <p className="text-xs leading-snug text-[#647A9B]">{scheduledAtLabel}</p>
      ) : null}
    </div>
  );
}
