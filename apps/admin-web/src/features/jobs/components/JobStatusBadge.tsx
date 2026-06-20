"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type {
  JobStatus,
} from "@/src/features/jobs/types/job.types";

interface JobStatusBadgeProps {
  status: JobStatus;

  isActive: boolean;
}

export function JobStatusBadge({
  status,
  isActive,
}: JobStatusBadgeProps) {
  if (!isActive) {
    return (
      <Badge variant="danger">
        Inactive
      </Badge>
    );
  }

  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success">
          Active
        </Badge>
      );

    case "DRAFT":
      return (
        <Badge variant="warning">
          Draft
        </Badge>
      );

    case "CLOSED":
      return (
        <Badge variant="danger">
          Closed
        </Badge>
      );

    case "EXPIRED":
      return (
        <Badge variant="info">
          Expired
        </Badge>
      );

    default:
      return (
        <Badge variant="default">
          Unknown
        </Badge>
      );
  }
}