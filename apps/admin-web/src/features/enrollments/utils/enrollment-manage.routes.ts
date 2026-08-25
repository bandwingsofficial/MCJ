export const ENROLLMENT_MANAGE_DEFAULT_TAB = "overview" as const;

export type EnrollmentManageTabKey =
  | "overview"
  | "student"
  | "course"
  | "batch"
  | "payments"
  | "attendance"
  | "progress";

export function enrollmentManagePath(enrollmentId: string): string {
  return `/enrollments/${enrollmentId}/manage`;
}

export function enrollmentManageTabPath(
  enrollmentId: string,
  tab: EnrollmentManageTabKey,
): string {
  if (tab === ENROLLMENT_MANAGE_DEFAULT_TAB) {
    return enrollmentManagePath(enrollmentId);
  }

  return `${enrollmentManagePath(enrollmentId)}?tab=${tab}`;
}
