"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type {
  CourseStatus,
} from "@/src/features/courses/types/course.types";

interface Props {
  status: CourseStatus;
  deletedAt?: string | null;
  isDeleted?: boolean;
}

export function CourseStatusBadge({
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

  switch (status) {
    case "ACTIVE":
      return (
        <Badge
          variant="success"
          className="px-2.5 py-0.5 text-sm"
        >
          Active
        </Badge>
      );

    case "INACTIVE":
      return (
        <Badge
          variant="warning"
          className="px-2.5 py-0.5 text-sm"
        >
          Inactive
        </Badge>
      );

    case "DRAFT":
      return (
        <Badge
          variant="default"
          className="px-2.5 py-0.5 text-sm"
        >
          Draft
        </Badge>
      );

    case "ARCHIVED":
      return (
        <Badge
          variant="danger"
          className="px-2.5 py-0.5 text-sm"
        >
          Archived
        </Badge>
      );

    default:
      return (
        <Badge
          variant="default"
          className="px-2.5 py-0.5 text-sm"
        >
          {status}
        </Badge>
      );
  }
}
