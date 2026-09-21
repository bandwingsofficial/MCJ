import { Badge } from "@/src/shared/components/ui/badge";

import {
  getAssignmentStatus,
  getAssignmentStatusLabel,
  type JobApplication,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationAssignmentStatusBadgeProps {
  application: Pick<JobApplication, "interviewAssignment">;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function JobApplicationAssignmentStatusBadge({
  application,
}: JobApplicationAssignmentStatusBadgeProps) {
  const status = getAssignmentStatus(application);

  return (
    <Badge
      variant={status === "ASSIGNED" ? "info" : "default"}
      className={compactClass}
    >
      {getAssignmentStatusLabel(status)}
    </Badge>
  );
}
