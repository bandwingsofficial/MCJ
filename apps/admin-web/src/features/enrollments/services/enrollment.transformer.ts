// src/features/enrollments/services/enrollment.transformer.ts

import { Enrollment } from "../types";

export const transformEnrollment = (
  enrollment: Enrollment,
) => ({
  ...enrollment,

  studentName: `${enrollment.student.firstName} ${enrollment.student.lastName}`,

  courseName:
    enrollment.course.title,

  batchName:
    enrollment.batch.name,

  branchName:
    enrollment.branch.branchName,
});

export const transformEnrollments = (
  enrollments: Enrollment[],
) =>
  enrollments.map(
    transformEnrollment,
  );