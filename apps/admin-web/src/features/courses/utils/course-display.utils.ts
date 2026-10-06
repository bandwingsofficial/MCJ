import { getCourseMinimumQualificationLabel } from "@mcj/shared-constants";

import type {
  CourseQualification,
} from "@/src/features/courses/types/course.types";

export function formatCourseQualification(
  qualification: CourseQualification | string,
): string {
  return getCourseMinimumQualificationLabel(qualification);
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
