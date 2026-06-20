"use client";

import { Badge } from "@/src/shared/components/ui/badge";

import {
  StudentStatus,
} from "@/src/features/students/types/student.types";

interface StudentStatusBadgeProps {
  status: StudentStatus;
}

const STATUS_VARIANTS: Record<
  StudentStatus,
  "success" | "warning" | "danger" | "info" | "default"
> = {
  ACTIVE: "success",

  ADMITTED: "info",

  LEAD: "warning",

  ENQUIRED: "warning",

  INACTIVE: "default",

  COMPLETED: "success",

  PLACED: "success",

  DROPPED: "danger",
};

export function StudentStatusBadge({
  status,
}: StudentStatusBadgeProps) {
  return (
    <Badge
      variant={STATUS_VARIANTS[status]}
    >
      {status.replaceAll("_", " ")}
    </Badge>
  );
}