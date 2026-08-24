// src/features/enrollments/constants/enrollment-status.ts

import { EnrollmentStatus } from "../types";

export const ENROLLMENT_STATUS_OPTIONS = [
  {
    label: "Pending",
    value: EnrollmentStatus.PENDING,
  },
  {
    label: "Pending Approval",
    value: EnrollmentStatus.PENDING_APPROVAL,
  },
  {
    label: "Admitted",
    value: EnrollmentStatus.ADMITTED,
  },
  {
    label: "Active",
    value: EnrollmentStatus.ACTIVE,
  },
  {
    label: "Completed",
    value: EnrollmentStatus.COMPLETED,
  },
  {
    label: "Cancelled",
    value: EnrollmentStatus.CANCELLED,
  },
  {
    label: "Dropped",
    value: EnrollmentStatus.DROPPED,
  },
  {
    label: "Rejected",
    value: EnrollmentStatus.REJECTED,
  },
];

export const ENROLLMENT_STATUS_BADGE_VARIANTS = {
  [EnrollmentStatus.PENDING]: "warning",
  [EnrollmentStatus.PENDING_APPROVAL]: "warning",
  [EnrollmentStatus.ADMITTED]: "info",
  [EnrollmentStatus.ACTIVE]: "success",
  [EnrollmentStatus.COMPLETED]: "success",
  [EnrollmentStatus.CANCELLED]: "danger",
  [EnrollmentStatus.DROPPED]: "danger",
  [EnrollmentStatus.REJECTED]: "danger",
} as const;