export const VALID_LEARNING_ENROLLMENT_STATUSES = [
  "ADMITTED",
  "ACTIVE",
] as const;

export function isAdmittedStudentStatus(
  studentStatus: string | null | undefined,
): boolean {
  return studentStatus === "ADMITTED";
}

export function isValidLearningEnrollmentStatus(
  enrollmentStatus: string | null | undefined,
): boolean {
  return (
    enrollmentStatus === "ADMITTED" || enrollmentStatus === "ACTIVE"
  );
}
