const ADMITTED_STATUS = "ADMITTED";
const ADVANCED_STATUS = "ADVANCED";

export const VALID_LEARNING_ENROLLMENT_STATUSES = [
  "ADMITTED",
  "ACTIVE",
] as const;

export function isAdmittedStudentStatus(
  studentStatus: string | null | undefined,
): boolean {
  return studentStatus === ADMITTED_STATUS;
}

export function isValidLearningEnrollmentStatus(
  enrollmentStatus: string | null | undefined,
): boolean {
  return (
    enrollmentStatus === "ADMITTED" ||
    enrollmentStatus === "ACTIVE"
  );
}

export function resolveCustomerStudentAccess(input: {
  hasStudentRecord: boolean;
  studentStatus: string | null;
  hasValidEnrollment: boolean;
}): {
  showProfile: true;
  showMyApplications: boolean;
  showMyCourses: boolean;
  showMyEnrollment: boolean;
} {
  const admittedLearningAccess =
    input.hasStudentRecord &&
    isAdmittedStudentStatus(input.studentStatus) &&
    input.hasValidEnrollment;

  const advancedEnrollmentAccess =
    input.hasStudentRecord &&
    input.studentStatus === ADVANCED_STATUS;

  return {
    showProfile: true,
    showMyApplications: input.hasStudentRecord,
    showMyCourses: admittedLearningAccess,
    showMyEnrollment: admittedLearningAccess || advancedEnrollmentAccess,
  };
}
