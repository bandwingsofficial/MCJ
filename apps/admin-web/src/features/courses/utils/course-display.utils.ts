import {
  COURSE_MODE_LABELS,
  COURSE_QUALIFICATION_LABELS,
} from "@/src/features/courses/constants/course.constants";

import type {
  CourseMode,
  CourseQualification,
} from "@/src/features/courses/types/course.types";

export function formatCourseMode(
  mode: string | null | undefined,
): string {
  if (!mode) {
    return "—";
  }

  return (
    COURSE_MODE_LABELS[mode as CourseMode] ??
    mode.charAt(0) + mode.slice(1).toLowerCase()
  );
}

export function formatCourseModes(
  modes: CourseMode[] | undefined,
): string {
  if (!modes?.length) {
    return "—";
  }

  return modes.map((mode) => formatCourseMode(mode)).join(", ");
}

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
