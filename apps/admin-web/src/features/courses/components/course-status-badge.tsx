"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import type {
  CourseStatus,
} from "@/src/features/courses/types/course.types";

interface Props {
  status: CourseStatus;
}

export function CourseStatusBadge({
  status,
}: Props) {
  switch (status) {
    case "ACTIVE":
      return (
        <Badge variant="success">
          Active
        </Badge>
      );

    case "INACTIVE":
      return (
        <Badge variant="danger">
          Inactive
        </Badge>
      );

    case "DRAFT":
      return (
        <Badge variant="warning">
          Draft
        </Badge>
      );

    case "ARCHIVED":
      return (
        <Badge variant="default">
          Archived
        </Badge>
      );

    default:
      return (
        <Badge variant="default">
          {status}
        </Badge>
      );
  }
}