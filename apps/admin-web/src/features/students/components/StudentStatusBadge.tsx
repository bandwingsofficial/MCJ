"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { StudentStatus } from "@/src/features/students/types/student.types";

interface StudentStatusBadgeProps {
  status: StudentStatus;
  isActive?: boolean;
  isDeleted?: boolean;
}

const STATUS_VARIANTS: Record<
  StudentStatus,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  LEAD: "warning",
  ENQUIRED: "warning",
  ADMITTED: "info",
  COMPLETED: "default",
  DROPPED: "danger",
  PLACED: "success",
};

const STATUS_LABELS: Record<StudentStatus, string> = {
  LEAD: "Lead",
  ENQUIRED: "Enquired",
  ADMITTED: "Admitted",
  COMPLETED: "Completed",
  DROPPED: "Dropped",
  PLACED: "Placed",
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

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge variant={STATUS_VARIANTS[status]} className={compactClass}>
        {STATUS_LABELS[status]}
      </Badge>
      {isActive === false ? (
        <Badge variant="danger" className={compactClass}>
          Inactive
        </Badge>
      ) : null}
    </div>
  );
}
