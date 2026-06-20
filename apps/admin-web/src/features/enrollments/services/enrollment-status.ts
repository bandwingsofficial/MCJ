// src/features/enrollments/services/enrollment-status.ts

import {
  EnrollmentStatus,
} from "../types";

export const canUpdateStatus = (
  current: EnrollmentStatus,
  next: EnrollmentStatus,
) => {
  const transitions = {
    PENDING: [
      EnrollmentStatus.ADMITTED,
      EnrollmentStatus.CANCELLED,
    ],

    ADMITTED: [
      EnrollmentStatus.ACTIVE,
      EnrollmentStatus.CANCELLED,
    ],

    ACTIVE: [
      EnrollmentStatus.COMPLETED,
      EnrollmentStatus.DROPPED,
    ],

    COMPLETED: [],

    CANCELLED: [],

    DROPPED: [],
  };

  return transitions[
    current
  ]?.includes(next);
};