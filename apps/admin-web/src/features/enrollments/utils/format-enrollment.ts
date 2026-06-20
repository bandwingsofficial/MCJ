// src/features/enrollments/utils/format-enrollment.ts

import { Enrollment } from "../types";

export function getStudentName(
  enrollment: Enrollment,
): string {
  return `${enrollment.student.firstName} ${enrollment.student.lastName}`;
}

export function getCourseName(
  enrollment: Enrollment,
): string {
  return enrollment.course.title;
}

export function getBatchName(
  enrollment: Enrollment,
): string {
  return enrollment.batch.name;
}

export function getBranchName(
  enrollment: Enrollment,
): string {
  return enrollment.branch.branchName;
}

export function getEnrollmentNumber(
  enrollment: Enrollment,
): string {
  return enrollment.enrollmentNumber;
}