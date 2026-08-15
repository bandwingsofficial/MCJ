"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type {
  TrainerStatus,
} from "@/src/features/trainers/types/trainer.types";

interface Props {
  status: TrainerStatus;
  deletedAt?: string | null;
  isDeleted?: boolean;
}

export function TrainerStatusBadge({
  status,
  deletedAt,
  isDeleted,
}: Props) {
  if (deletedAt || isDeleted) {
    return (
      <Badge
        variant="danger"
        className="px-2.5 py-0.5 text-sm"
      >
        Archived
      </Badge>
    );
  }

  if (status === "ACTIVE") {
    return (
      <Badge
        variant="success"
        className="px-2.5 py-0.5 text-sm"
      >
        Active
      </Badge>
    );
  }

  return (
    <Badge
      variant="warning"
      className="px-2.5 py-0.5 text-sm"
    >
      Inactive
    </Badge>
  );
}
