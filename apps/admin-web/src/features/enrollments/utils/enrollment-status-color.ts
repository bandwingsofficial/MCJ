// src/features/enrollments/utils/enrollment-status-color.ts

import {
  EnrollmentStatus,
} from "../types";

export function getEnrollmentStatusVariant(
  status: EnrollmentStatus,
):
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info" {
  switch (status) {
    case EnrollmentStatus.ACTIVE:
      return "success";

    case EnrollmentStatus.ADMITTED:
      return "info";

    case EnrollmentStatus.PENDING:
      return "warning";

    case EnrollmentStatus.COMPLETED:
      return "success";

    case EnrollmentStatus.CANCELLED:
      return "danger";

    case EnrollmentStatus.DROPPED:
      return "danger";

    default:
      return "default";
  }
}