// src/features/enrollments/services/enrollment-status.ts

import { EnrollmentStatus } from "../types";

const transitions: Record<
  EnrollmentStatus,
  EnrollmentStatus[]
> = {
  [EnrollmentStatus.PENDING]: [
    EnrollmentStatus.ADMITTED,
    EnrollmentStatus.CANCELLED,
  ],

  [EnrollmentStatus.ADMITTED]: [
    EnrollmentStatus.ACTIVE,
    EnrollmentStatus.CANCELLED,
  ],

  [EnrollmentStatus.ACTIVE]: [
    EnrollmentStatus.COMPLETED,
    EnrollmentStatus.DROPPED,
  ],

  [EnrollmentStatus.COMPLETED]: [],

  [EnrollmentStatus.CANCELLED]: [],

  [EnrollmentStatus.DROPPED]: [],
};

export const canUpdateStatus = (
  current: EnrollmentStatus,
  next: EnrollmentStatus,
): boolean => {
  return transitions[current].includes(next);
};