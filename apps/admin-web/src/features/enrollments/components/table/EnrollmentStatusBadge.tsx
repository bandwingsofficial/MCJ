"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import { EnrollmentStatus } from "../../types";
import { ENROLLMENT_ADMIN_STATUS_LABELS } from "@/src/features/enrollments/utils/enrollment-workflow-status.utils";

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
  isDeleted?: boolean;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

const ADMIN_LABELS: Record<string, string> = {
  ...ENROLLMENT_ADMIN_STATUS_LABELS,
  [EnrollmentStatus.ADVANCED]: "Advanced",
  [EnrollmentStatus.CANCELLED]: "Cancelled",
};

const ADMIN_VARIANTS = {
  [EnrollmentStatus.ADVANCED]: "warning",
  [EnrollmentStatus.ADMITTED]: "info",
  [EnrollmentStatus.COMPLETED]: "success",
  [EnrollmentStatus.CANCELLED]: "danger",
} as const;

export function EnrollmentStatusBadge({
  status,
  isDeleted = false,
}: EnrollmentStatusBadgeProps) {
  if (isDeleted) {
    return (
      <Badge variant="danger" className={compactClass}>
        Archived
      </Badge>
    );
  }

  const adminStatus =
    status === EnrollmentStatus.COMPLETED
      ? EnrollmentStatus.COMPLETED
      : status === EnrollmentStatus.ADVANCED
        ? EnrollmentStatus.ADVANCED
        : status === EnrollmentStatus.CANCELLED
          ? EnrollmentStatus.CANCELLED
          : EnrollmentStatus.ADMITTED;

  const variant =
    ADMIN_VARIANTS[adminStatus] ?? ("default" as const);

  return (
    <Badge variant={variant} className={compactClass}>
      {ADMIN_LABELS[adminStatus] ?? adminStatus}
    </Badge>
  );
}

