"use client";

import { Badge } from "@/src/shared/components/ui/badge";
import { STUDENT_ENROLLMENT_WORKFLOW_STATUS_LABELS } from "@mcj/shared-constants";

import type { StudentStatus } from "@/src/features/students/types/student.types";
import { normalizeStudentWorkflowStatus } from "@/src/features/students/utils/student-workflow-status.utils";

interface StudentStatusBadgeProps {
  status: StudentStatus | string;
  isActive?: boolean;
  isDeleted?: boolean;
}

const STATUS_VARIANTS: Record<
  StudentStatus,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  LEAD: "warning",
  ENROLLED: "info",
  JOINED: "info",
  COMPLETED: "default",
  CANCELLED: "danger",
  PLACED: "success",
};

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

export function StudentStatusBadge({
  status,
  isActive,
  isDeleted = false,
}: StudentStatusBadgeProps) {
  if (isDeleted) {
    return (
      <Badge variant="danger" className={compactClass}>
        Archived
      </Badge>
    );
  }

  const workflow = normalizeStudentWorkflowStatus(status);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={STATUS_VARIANTS[workflow]} className={compactClass}>
        {STUDENT_ENROLLMENT_WORKFLOW_STATUS_LABELS[workflow]}
      </Badge>
      {isActive === false ? (
        <Badge variant="danger" className={compactClass}>
          Inactive
        </Badge>
      ) : null}
    </div>
  );
}
