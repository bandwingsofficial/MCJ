import type { BatchCourseAssignment } from "@/src/features/batches/types/batch.types";

export const NO_BATCH_COURSES_LABEL = "No courses assigned yet";

export function getCourseCategoryName(
  assignment: BatchCourseAssignment,
): string {
  return assignment.course.category?.name?.trim() ?? "";
}

export function getUniqueCategoryNames(
  assignments: BatchCourseAssignment[],
): string[] {
  const seen = new Set<string>();
  const names: string[] = [];

  for (const assignment of assignments) {
    const name = getCourseCategoryName(assignment);
    if (!name || seen.has(name)) {
      continue;
    }

    seen.add(name);
    names.push(name);
  }

  return names;
}

export function formatBatchCategoriesFromAssignments(
  assignments: BatchCourseAssignment[],
): string {
  if (assignments.length === 0) {
    return NO_BATCH_COURSES_LABEL;
  }

  const categories = getUniqueCategoryNames(assignments);

  if (categories.length === 0) {
    return NO_BATCH_COURSES_LABEL;
  }

  return categories.join(", ");
}

export function formatAssignedCourseTitles(
  assignments: BatchCourseAssignment[],
): string {
  if (assignments.length === 0) {
    return NO_BATCH_COURSES_LABEL;
  }

  return assignments.map((assignment) => assignment.course.title).join(", ");
}

export function formatAssignedTrainerNames(
  assignments: BatchCourseAssignment[],
): string {
  if (assignments.length === 0) {
    return NO_BATCH_COURSES_LABEL;
  }

  const seen = new Set<string>();
  const names: string[] = [];

  for (const assignment of assignments) {
    const name = [assignment.trainer.firstName, assignment.trainer.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    if (!name || seen.has(name)) {
      continue;
    }

    seen.add(name);
    names.push(name);
  }

  return names.length > 0 ? names.join(", ") : NO_BATCH_COURSES_LABEL;
}

export function formatDaysRemainingOrExpiredStatus(
  isExpired: boolean,
  isNotStarted: boolean,
  daysRemaining: number | null,
  daysUntilStart: number | null,
): string {
  if (isExpired) {
    return "Expired";
  }

  if (isNotStarted && daysUntilStart !== null) {
    return `Starts in ${daysUntilStart} day${daysUntilStart === 1 ? "" : "s"}`;
  }

  const remaining = daysRemaining ?? 0;
  return `${remaining} day${remaining === 1 ? "" : "s"} remaining`;
}
