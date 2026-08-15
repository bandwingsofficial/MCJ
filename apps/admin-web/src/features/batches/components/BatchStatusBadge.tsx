"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { BatchStatus } from "@/src/features/batches/types/batch.types";

interface BatchStatusBadgeProps {
  status: BatchStatus;
  isActive?: boolean;
  isDeleted?: boolean;
}

export function BatchStatusBadge({
  status,
  isActive = true,
  isDeleted = false,
}: BatchStatusBadgeProps) {
  if (isDeleted) {
    return (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Archived
      </Badge>
    );
  }

  if (isActive === false) {
    return (
      <Badge variant="warning" className="px-2.5 py-0.5 text-sm">
        Inactive
      </Badge>
    );
  }

  switch (status) {
    case "UPCOMING":
      return (
        <Badge variant="info" className="px-2.5 py-0.5 text-sm">
          Upcoming
        </Badge>
      );

    case "ONGOING":
      return (
        <Badge variant="success" className="px-2.5 py-0.5 text-sm">
          Ongoing
        </Badge>
      );

    case "COMPLETED":
      return (
        <Badge variant="default" className="px-2.5 py-0.5 text-sm">
          Completed
        </Badge>
      );

    case "CANCELLED":
      return (
        <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
          Cancelled
        </Badge>
      );

    case "ARCHIVED":
      return (
        <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
          Archived
        </Badge>
      );

    default:
      return (
        <Badge className="px-2.5 py-0.5 text-sm">
          {status}
        </Badge>
      );
  }
}
