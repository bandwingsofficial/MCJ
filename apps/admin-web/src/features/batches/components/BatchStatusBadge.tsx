"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type { BatchStatus } from "@/src/features/batches/types/batch.types";

interface Props {
  isActive?: boolean;
  /** @deprecated Legacy lifecycle badge for manage/detail views. */
  status?: BatchStatus;
  isDeleted?: boolean;
}

export function BatchStatusBadge({
  isActive = true,
  status,
  isDeleted = false,
}: Props) {
  if (isDeleted) {
    return (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Archived
      </Badge>
    );
  }

  if (status && status !== "UPCOMING" && status !== "ONGOING") {
    switch (status) {
      case "COMPLETED":
        return (
          <Badge variant="default" className="px-2.5 py-0.5 text-sm">
            Completed
          </Badge>
        );
      case "CANCELLED":
      case "ARCHIVED":
        return (
          <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
            {status === "ARCHIVED" ? "Archived" : "Cancelled"}
          </Badge>
        );
      default:
        break;
    }
  }

  if (isActive === false) {
    return (
      <Badge variant="danger" className="px-2.5 py-0.5 text-sm">
        Inactive
      </Badge>
    );
  }

  return (
    <Badge variant="success" className="px-2.5 py-0.5 text-sm">
      Active
    </Badge>
  );
}
