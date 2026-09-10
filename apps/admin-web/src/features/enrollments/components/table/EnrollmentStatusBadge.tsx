"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import { EnrollmentStatus } from "../../types";

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
  isDeleted?: boolean;
}

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

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

  switch (status) {
    case EnrollmentStatus.PENDING:
      return (
        <Badge variant="warning" className={compactClass}>
          Pending
        </Badge>
      );

    case EnrollmentStatus.PENDING_APPROVAL:
      return (
        <Badge variant="warning" className={compactClass}>
          Pending Approval
        </Badge>
      );

    case EnrollmentStatus.ADMITTED:
      return (
        <Badge variant="info" className={compactClass}>
          Admitted
        </Badge>
      );

    case EnrollmentStatus.ACTIVE:
      return (
        <Badge variant="success" className={compactClass}>
          Active
        </Badge>
      );

    case EnrollmentStatus.COMPLETED:
      return (
        <Badge variant="success" className={compactClass}>
          Completed
        </Badge>
      );

    case EnrollmentStatus.CANCELLED:
      return (
        <Badge variant="danger" className={compactClass}>
          Cancelled
        </Badge>
      );

    case EnrollmentStatus.DROPPED:
      return (
        <Badge variant="danger" className={compactClass}>
          Dropped
        </Badge>
      );

    case EnrollmentStatus.REJECTED:
      return (
        <Badge variant="danger" className={compactClass}>
          Rejected
        </Badge>
      );

    default:
      return (
        <Badge variant="default" className={compactClass}>
          {status}
        </Badge>
      );
  }
}
