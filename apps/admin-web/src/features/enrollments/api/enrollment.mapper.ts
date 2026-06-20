// src/features/enrollments/api/enrollment.mapper.ts

import {
  Enrollment,
  EnrollmentListResponse,
  EnrollmentResponse,
} from "../types";

export const enrollmentMapper = {
  toEnrollment(
    response: EnrollmentResponse,
  ): Enrollment {
    return response.data;
  },

  toEnrollments(
    response: EnrollmentListResponse,
  ): Enrollment[] {
    return response.data;
  },
};