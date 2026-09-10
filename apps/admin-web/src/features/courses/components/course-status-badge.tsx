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
  const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

  if (deletedAt || isDeleted) {
    return (
      <Badge variant="danger" className={compactClass}>
        Archived
      </Badge>
    );
  }

  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success" className={compactClass}>
          Active
        </Badge>
      );

    case "INACTIVE":
      return (
        <Badge variant="danger" className={compactClass}>
          Inactive
        </Badge>
      );

    case "DRAFT":
      return (
        <Badge variant="default" className={compactClass}>
          Draft
        </Badge>
      );

    case "ARCHIVED":
      return (
        <Badge variant="danger" className={compactClass}>
          Archived
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
