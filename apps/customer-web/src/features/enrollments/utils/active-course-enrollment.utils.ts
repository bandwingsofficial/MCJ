import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

const CURRENT_STATUSES = new Set([
  "PENDING",
  "PENDING_APPROVAL",
  "ADVANCED",
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

export function findAnyBlockingEnrollment(
  enrollments: Enrollment[],
): Enrollment | null {
  return (
    enrollments.find((enrollment) =>
      isActiveCourseEnrollmentBlocking(enrollment),
    ) ?? null
  );
}

export function getGlobalActiveEnrollmentBlockCopy(): {
  title: string;
  description: string;
} {
  return {
    title: "You are already enrolled in a course.",
    description:
      "You cannot create another enrollment at this time.",
  };
}

export const STUDENT_ENROLLMENTS_PATH = "/student/enrollments";

export function getMyLearningCoursePath(courseId: string): string {
  return `/student/my-learning/${courseId}`;
}

export function isAdmittedLearningEnrollmentStatus(
  status: string | null | undefined,
): boolean {
  return status === "ADMITTED" || status === "ACTIVE";
}

export function isAdvancedEnrollmentStatus(
  status: string | null | undefined,
): boolean {
  return status === "ADVANCED";
}

export interface ActiveEnrollmentBlockPresentation {
  sectionLabel: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
}

export function getActiveEnrollmentBlockPresentation(
  enrollment: Enrollment,
  viewingCourseId: string,
): ActiveEnrollmentBlockPresentation {
  const endDate = resolveEnrollmentBatchEndDate(enrollment);
  const endLabel = endDate
    ? endDate.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;
  const enrolledCourseTitle = enrollment.course.title.trim();
  const sameCourse = enrollment.course.id === viewingCourseId;

  if (isAdmittedLearningEnrollmentStatus(enrollment.status)) {
    return {
      sectionLabel: "YOUR LEARNING",
      title: `You're currently enrolled in ${enrolledCourseTitle}.`,
      description: endLabel
        ? `Your current course is active until ${endLabel}.`
        : "Your current course is active.",
      buttonLabel: "Continue Learning",
      href: getMyLearningCoursePath(enrollment.course.id),
    };
  }

  if (isAdvancedEnrollmentStatus(enrollment.status)) {
    const courseCopy = getActiveCourseEnrollmentBlockCopy(
      sameCourse ? endDate : null,
    );

    return {
      sectionLabel: "YOUR ENROLLMENT",
      title: sameCourse
        ? courseCopy.title
        : getGlobalActiveEnrollmentBlockCopy().title,
      description: sameCourse
        ? courseCopy.description
        : getGlobalActiveEnrollmentBlockCopy().description,
      buttonLabel: "View Enrollment",
      href: STUDENT_ENROLLMENTS_PATH,
    };
  }

  const fallback = getActiveCourseEnrollmentBlockCopy(sameCourse ? endDate : null);

  return {
    sectionLabel: "YOUR ENROLLMENT",
    title: fallback.title,
    description: fallback.description,
    buttonLabel: "View Enrollment",
    href: STUDENT_ENROLLMENTS_PATH,
  };
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
