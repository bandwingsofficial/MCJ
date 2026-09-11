"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { StudentJobStatus } from "@/src/features/students/types/student.types";

interface StudentJobStatusBadgeProps {
  jobStatus: StudentJobStatus | null;
}

const JOB_STATUS_LABELS: Record<StudentJobStatus, string> = {
  JOB_APPLIED: "Job Applied",
};

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function StudentJobStatusBadge({
  jobStatus,
}: StudentJobStatusBadgeProps) {
  if (!jobStatus) {
    return <span className="text-sm text-slate-400">—</span>;
  }

  return (
    <Badge variant="info" className={compactClass}>
      {JOB_STATUS_LABELS[jobStatus]}
    </Badge>
  );
}
