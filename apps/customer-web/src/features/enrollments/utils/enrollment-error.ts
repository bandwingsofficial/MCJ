import { ENROLLMENT_DEFAULT_ERROR } from "@/src/features/enrollments/constants/enrollment.constants";

const ERROR_MESSAGES: Record<string, string> = {
  BATCH_FULL:
    "This batch is already full. Please choose another batch.",

  COURSE_IN_DRAFT:
    "This course is currently unavailable for enrollment.",

  STUDENT_ALREADY_ENROLLED:
    "You are already enrolled in this batch.",

  BATCH_COURSE_MISMATCH:
    "This batch is not available for the selected course.",

  BATCH_BRANCH_MISMATCH:
    "This batch is not available at the selected branch.",

  STUDENT_BRANCH_MISMATCH:
    "Your student profile is assigned to a different branch. Please contact support or choose a batch at your branch.",

  STUDENT_NOT_FOUND:
    "Please complete your student profile before enrolling.",

  COURSE_INACTIVE:
    "This course is currently unavailable for enrollment.",

  BATCH_NOT_FOUND:
    "The selected batch is no longer available.",

  BATCH_INACTIVE:
    "The selected batch is not open for enrollment.",
};

export function getEnrollmentErrorMessage(
  code?: string,
): string {
  if (!code) {
    return ENROLLMENT_DEFAULT_ERROR;
  }

  return (
    ERROR_MESSAGES[code] ??
    ENROLLMENT_DEFAULT_ERROR
  );
}