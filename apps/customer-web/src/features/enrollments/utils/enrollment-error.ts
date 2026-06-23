import { ENROLLMENT_DEFAULT_ERROR } from "@/src/features/enrollments/constants/enrollment.constants";

const ERROR_MESSAGES: Record<string, string> = {
  BATCH_FULL:
    "This batch is already full. Please choose another batch.",

  COURSE_IN_DRAFT:
    "This course is currently unavailable for enrollment.",

  STUDENT_ALREADY_ENROLLED:
    "You are already enrolled in this batch.",
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