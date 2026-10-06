export const VALID_LEARNING_ENROLLMENT_STATUSES = [
  "JOINED",
  "ACTIVE",
] as const;

export function isAdmittedStudentStatus(
  studentStatus: string | null | undefined,
): boolean {
  return studentStatus === "JOINED";
}

export function isValidLearningEnrollmentStatus(
  enrollmentStatus: string | null | undefined,
): boolean {
  return (
    enrollmentStatus === "JOINED" || enrollmentStatus === "ACTIVE"
  );
}
