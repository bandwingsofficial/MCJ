import {
  COURSE_QUALIFICATION_LABELS,
} from "@/src/features/courses/constants/course.constants";

import type {
  CourseQualification,
} from "@/src/features/courses/types/course.types";

export function formatCourseQualification(
  qualification: CourseQualification,
): string {
  return COURSE_QUALIFICATION_LABELS[qualification] ?? qualification;
}

export function formatCourseQualifications(
  qualifications: CourseQualification[] | undefined,
): string {
  if (!qualifications?.length) {
    return "—";
  }

  return qualifications
    .map((item) => formatCourseQualification(item))
    .join(", ");
}
