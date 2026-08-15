import type {
  BulkCourseOperationResult,
  CourseListItem,
} from "@/src/features/courses/types/course.types";

export function isArchivedCourse(
  course: CourseListItem
): boolean {
  return Boolean(course.deletedAt ?? course.isDeleted);
}

export function getEligibleActivateIds(
  courses: CourseListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return courses
    .filter(
      (course) =>
        selected.has(course.id) &&
        !isArchivedCourse(course) &&
        course.status !== "ACTIVE"
    )
    .map((course) => course.id);
}

export function getEligibleDeactivateIds(
  courses: CourseListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return courses
    .filter(
      (course) =>
        selected.has(course.id) &&
        !isArchivedCourse(course) &&
        course.status === "ACTIVE"
    )
    .map((course) => course.id);
}

export function getEligibleDeleteIds(
  courses: CourseListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return courses
    .filter(
      (course) =>
        selected.has(course.id) && !isArchivedCourse(course)
    )
    .map((course) => course.id);
}

export function getEligibleRestoreIds(
  courses: CourseListItem[],
  selectedIds: string[]
): string[] {
  const selected = new Set(selectedIds);

  return courses
    .filter(
      (course) =>
        selected.has(course.id) && isArchivedCourse(course)
    )
    .map((course) => course.id);
}

export function getEligiblePermanentDeleteIds(
  courses: CourseListItem[],
  selectedIds: string[]
): string[] {
  return getEligibleRestoreIds(courses, selectedIds);
}

export function formatBulkResultToast(
  result: BulkCourseOperationResult,
  successLabel: string
): string {
  if (result.failedCount === 0) {
    return `${result.successCount} ${successLabel}`;
  }

  const failurePreview = result.failures
    .slice(0, 2)
    .map((item) => item.message)
    .join(" ");

  return `${result.successCount} ${successLabel}. ${result.failedCount} failed.${failurePreview ? ` ${failurePreview}` : ""}`;
}
