// src/features/enrollments/services/enrollment.mapper.ts

import { Enrollment } from "../types";

export const mapEnrollment = (
  enrollment: Enrollment,
): Enrollment => ({
  ...enrollment,
});

export const mapEnrollments = (
  enrollments: Enrollment[],
): Enrollment[] =>
  enrollments.map(mapEnrollment);