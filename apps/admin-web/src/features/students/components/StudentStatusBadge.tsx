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

export function StudentStatusBadge({
  status,
  isActive,
  isDeleted = false,
}: StudentStatusBadgeProps) {
  if (isDeleted) {
    return (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Archived
      </Badge>
    );
  }

  return (
  <div className="flex flex-wrap items-center gap-1.5">
    <Badge variant={STATUS_VARIANTS[status]} className="px-2.5 py-0.5 text-sm">
      {STATUS_LABELS[status]}
    </Badge>
    {isActive === false ? (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Inactive
      </Badge>
    ) : null}
  </div>
  );
}
