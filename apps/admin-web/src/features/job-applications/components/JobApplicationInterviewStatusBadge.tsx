"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import { resolveApplicationInterviewDisplay } from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationInterviewStatusBadgeProps {
  application: JobApplication;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function JobApplicationInterviewStatusBadge({
  application,
}: JobApplicationInterviewStatusBadgeProps) {
  const display = resolveApplicationInterviewDisplay(application);

  return (
    <Badge variant={display.variant} className={compactClass}>
      {display.label}
    </Badge>
  );
}
