"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import { EnrollmentStatus } from "../../types";

interface EnrollmentStatusBadgeProps {
  status: EnrollmentStatus;
}

export function EnrollmentStatusBadge({
  status,
}: EnrollmentStatusBadgeProps) {
  switch (status) {
    case EnrollmentStatus.PENDING:
      return (
        <Badge variant="warning">
          Pending
        </Badge>
      );

    case EnrollmentStatus.PENDING_APPROVAL:
      return (
        <Badge variant="warning">
          Pending Approval
        </Badge>
      );

    case EnrollmentStatus.ADMITTED:
      return (
        <Badge variant="info">
          Admitted
        </Badge>
      );

    case EnrollmentStatus.ACTIVE:
      return (
        <Badge variant="success">
          Active
        </Badge>
      );

    case EnrollmentStatus.COMPLETED:
      return (
        <Badge variant="success">
          Completed
        </Badge>
      );

    case EnrollmentStatus.CANCELLED:
      return (
        <Badge variant="danger">
          Cancelled
        </Badge>
      );

    case EnrollmentStatus.DROPPED:
      return (
        <Badge variant="danger">
          Dropped
        </Badge>
      );

    case EnrollmentStatus.REJECTED:
      return (
        <Badge variant="danger">
          Rejected
        </Badge>
      );

    default:
      return (
        <Badge>
          {status}
        </Badge>
      );
  }
}