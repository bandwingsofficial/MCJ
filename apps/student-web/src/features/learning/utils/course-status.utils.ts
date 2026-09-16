import type {
  CourseCompletionDto,
  CourseProgressDto,
  EnrollmentDetailDto,
} from "@/src/features/learning/types/learning.types";

export type CourseTabStatus = "in_progress" | "completed" | "upcoming";

export function resolveCourseTabStatus(input: {
  progress: CourseProgressDto;
  completion: CourseCompletionDto | null;
  enrollment: EnrollmentDetailDto | null;
}): CourseTabStatus {
  if (
    input.completion?.isCourseCompleted ||
    input.progress.completionPercentage >= 100 ||
    (input.progress.totalLessons > 0 &&
      input.progress.completedLessons >= input.progress.totalLessons)
  ) {
    return "completed";
  }

  const startReference =
    input.enrollment?.batch.startDate ??
    input.enrollment?.joiningDate ??
    null;

  if (startReference) {
    const startDate = new Date(startReference);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    startDate.setHours(0, 0, 0, 0);

    if (startDate > today && input.progress.completedLessons === 0) {
      return "upcoming";
    }
  }

  return "in_progress";
}

export function getStartedDate(
  enrollment: EnrollmentDetailDto | null,
  progress: CourseProgressDto,
): string | null {
  const earliestCompletion = progress.items
    .map((item) => item.completedAt)
    .filter(Boolean)
    .sort()[0];

  return (
    earliestCompletion ??
    enrollment?.joiningDate ??
    enrollment?.batch.startDate ??
    null
  );
}

export function formatLearningDate(value: string | null): string {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
