const JOINED_STATUS = "JOINED";
const ENROLLED_STATUS = "ENROLLED";

export const VALID_LEARNING_ENROLLMENT_STATUSES = [
  "JOINED",
  "ACTIVE",
] as const;

export function isAdmittedStudentStatus(
  studentStatus: string | null | undefined,
): boolean {
  return studentStatus === JOINED_STATUS;
}

export function isValidLearningEnrollmentStatus(
  enrollmentStatus: string | null | undefined,
): boolean {
  return (
    enrollmentStatus === "JOINED" ||
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
  const joinedLearningAccess =
    input.hasStudentRecord &&
    isAdmittedStudentStatus(input.studentStatus) &&
    input.hasValidEnrollment;

  const enrolledEnrollmentAccess =
    input.hasStudentRecord &&
    input.studentStatus === ENROLLED_STATUS;

  return {
    showProfile: true,
    showMyApplications: input.hasStudentRecord,
    showMyCourses: joinedLearningAccess,
    showMyEnrollment: joinedLearningAccess || enrolledEnrollmentAccess,
  };
}
