"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type {
  BatchStatus,
} from "@/src/features/batches/types/batch.types";

interface BatchStatusBadgeProps {
  status: BatchStatus;
}

export function BatchStatusBadge({
  status,
}: BatchStatusBadgeProps) {
  switch (status) {
    case "UPCOMING":
      return (
        <Badge variant="info">
          Upcoming
        </Badge>
      );

    case "ONGOING":
      return (
        <Badge variant="success">
          Ongoing
        </Badge>
      );

    case "COMPLETED":
      return (
        <Badge variant="default">
          Completed
        </Badge>
      );

    case "CANCELLED":
      return (
        <Badge variant="danger">
          Cancelled
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