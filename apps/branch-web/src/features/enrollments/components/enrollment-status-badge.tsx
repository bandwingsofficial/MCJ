"use client";

import { Badge } from "@/src/shared/components/ui/badge";

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

interface EnrollmentStatusBadgeProps {
  status: string;
}

export function EnrollmentStatusBadge({ status }: EnrollmentStatusBadgeProps) {
  switch (status) {
    case "PENDING":
      return (
        <Badge variant="warning" className={compactClass}>
          Pending
        </Badge>
      );

    case "PENDING_APPROVAL":
      return (
        <Badge variant="warning" className={compactClass}>
          Pending Approval
        </Badge>
      );

    case "ENROLLED":
      return (
        <Badge variant="warning" className={compactClass}>
          Enrolled
        </Badge>
      );

    case "JOINED":
      return (
        <Badge variant="info" className={compactClass}>
          Joined
        </Badge>
      );

    case "ACTIVE":
      return (
        <Badge variant="success" className={compactClass}>
          Active
        </Badge>
      );

    case "COMPLETED":
      return (
        <Badge variant="success" className={compactClass}>
          Completed
        </Badge>
      );

    case "CANCELLED":
      return (
        <Badge variant="danger" className={compactClass}>
          Cancelled
        </Badge>
      );

    case "DROPPED":
      return (
        <Badge variant="danger" className={compactClass}>
          Dropped
        </Badge>
      );

    case "REJECTED":
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
