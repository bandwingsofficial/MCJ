import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

const CURRENT_STATUSES = new Set([
  "PENDING",
  "PENDING_APPROVAL",
  "ADMITTED",
  "ACTIVE",
]);

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function resolveEnrollmentBatchEndDate(
  enrollment: Pick<
    Enrollment,
    "expectedCompletionDate" | "batchTiming" | "batch"
  >,
): Date | null {
  const candidates = [
    enrollment.batch?.endDate ?? null,
    enrollment.batchTiming?.endDate ?? null,
    enrollment.expectedCompletionDate ?? null,
  ]
    .map((raw) => {
      if (!raw) {
        return null;
      }
      const date = new Date(raw);
      return Number.isNaN(date.getTime()) ? null : date;
    })
    .filter((value): value is Date => value !== null);

  if (!candidates.length) {
    return null;
  }

  return candidates.reduce((latest, current) =>
    current.getTime() > latest.getTime() ? current : latest,
  );
}

export function isActiveCourseEnrollmentBlocking(
  enrollment: Pick<
    Enrollment,
    | "isDeleted"
    | "status"
    | "expectedCompletionDate"
    | "batchTiming"
    | "batch"
  >,
  referenceDate: Date = new Date(),
): boolean {
  if (enrollment.isDeleted) {
    return false;
  }

  if (!CURRENT_STATUSES.has(enrollment.status)) {
    return false;
  }

  const endDate = resolveEnrollmentBatchEndDate(enrollment);
  if (!endDate) {
    return true;
  }

  return startOfDay(referenceDate).getTime() <= startOfDay(endDate).getTime();
}

export function findBlockingCourseEnrollment(
  enrollments: Enrollment[],
  courseId: string,
): Enrollment | null {
  return (
    enrollments.find(
      (enrollment) =>
        enrollment.course.id === courseId &&
        isActiveCourseEnrollmentBlocking(enrollment),
    ) ?? null
  );
}

export function getActiveCourseEnrollmentBlockCopy(
  endDate: Date | null,
): { title: string; description: string } {
  const endLabel = endDate
    ? endDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  return {
    title: "You're already enrolled in this course.",
    description: endLabel
      ? `Your current enrollment is active until ${endLabel}. You can enroll in this course again after your current batch is completed.`
      : "You can enroll in this course again after your current batch is completed.",
  };
}
