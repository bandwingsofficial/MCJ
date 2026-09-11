import { Badge } from "@/src/shared/components/ui/badge";

import type { JobApplicationInterviewStatus } from "@/src/features/job-applications/types/job-application.types";
import { getInterviewStatusLabel } from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationInterviewStatusBadgeProps {
  status: JobApplicationInterviewStatus;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

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

export function JobApplicationInterviewStatusBadge({
  status,
}: JobApplicationInterviewStatusBadgeProps) {
  return (
    <Badge variant={STATUS_VARIANTS[status]} className={compactClass}>
      {getInterviewStatusLabel(status)}
    </Badge>
  );
}
