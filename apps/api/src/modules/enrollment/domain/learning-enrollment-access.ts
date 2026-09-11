import { EnrollmentStatus } from './enums/enrollment-status.enum';

export function isValidLearningEnrollmentStatus(
  status: EnrollmentStatus | string | null | undefined,
): boolean {
  return (
    status === EnrollmentStatus.ADMITTED ||
    status === EnrollmentStatus.ACTIVE
  );
}
