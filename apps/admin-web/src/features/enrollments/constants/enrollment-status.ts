// src/features/enrollments/constants/enrollment-status.ts

import { EnrollmentStatus } from "../types";

export const CREATE_ENROLLMENT_STATUS_OPTIONS = [
  {
    label: "Advanced",
    value: EnrollmentStatus.ADVANCED,
  },
  {
    label: "Admitted",
    value: EnrollmentStatus.ADMITTED,
  },
];

/** Admin enrollment lifecycle: Admitted and Completed only. */
export const ENROLLMENT_STATUS_OPTIONS = [
  {
    label: "Admitted",
    value: EnrollmentStatus.ADMITTED,
  },
  {
    label: "Completed",
    value: EnrollmentStatus.COMPLETED,
  },
];

export const ENROLLMENT_STATUS_BADGE_VARIANTS = {
  [EnrollmentStatus.PENDING]: "warning",
  [EnrollmentStatus.PENDING_APPROVAL]: "warning",
  [EnrollmentStatus.ADVANCED]: "warning",
  [EnrollmentStatus.ADMITTED]: "info",
  [EnrollmentStatus.ACTIVE]: "success",
  [EnrollmentStatus.COMPLETED]: "success",
  [EnrollmentStatus.CANCELLED]: "danger",
  [EnrollmentStatus.DROPPED]: "danger",
  [EnrollmentStatus.REJECTED]: "danger",
} as const;
