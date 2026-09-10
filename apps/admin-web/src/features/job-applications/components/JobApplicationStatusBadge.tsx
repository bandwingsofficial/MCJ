import { Badge } from "@/src/shared/components/ui/badge";

import type { JobApplicationStatus } from "@/src/features/job-applications/types/job-application.types";
import { getOnboardingStatusLabel } from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationStatusBadgeProps {
  status: JobApplicationStatus;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

const STATUS_VARIANTS: Record<
  JobApplicationStatus,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  APPLIED: "default",
  SHORTLISTED: "info",
  ASSESSMENT: "warning",
  INTERVIEW: "info",
  SELECTED: "success",
  PLACED: "success",
  REJECTED: "danger",
};

export function JobApplicationStatusBadge({
  status,
}: JobApplicationStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={compactClass}>
      {getOnboardingStatusLabel(status)}
    </Badge>
  );
}
