import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

export const CURRENT_ENROLLMENT_STATUSES = [
  "PENDING",
  "PENDING_APPROVAL",
  "ADMITTED",
  "ACTIVE",
] as const;

export function isCurrentEnrollmentStatus(status?: string | null): boolean {
  if (!status) {
    return false;
  }

  return CURRENT_ENROLLMENT_STATUSES.includes(
    status as (typeof CURRENT_ENROLLMENT_STATUSES)[number],
  );
}

export function canUnenrollEnrollment(enrollment: {
  status?: string | null;
  isDeleted?: boolean;
}): boolean {
  return !enrollment.isDeleted && isCurrentEnrollmentStatus(enrollment.status);
}

export function formatEnrollmentLocation(enrollment: {
  branch?: { branchName?: string | null } | null;
  batch?: { name?: string | null; code?: string | null } | null;
  course?: { title?: string | null } | null;
}): string {
  const batchName = enrollment.batch?.name?.trim();
  const batchCode = enrollment.batch?.code?.trim();
  const batch = batchName
    ? batchCode
      ? `${batchName} (${batchCode})`
      : batchName
    : "";

  return [enrollment.branch?.branchName, batch, enrollment.course?.title]
    .map((part) => part?.trim())
    .filter(Boolean)
    .join(" • ");
}

export function currentEnrollmentByStudentId(
  enrollments: Enrollment[],
): Map<string, Enrollment> {
  const map = new Map<string, Enrollment>();

  for (const enrollment of enrollments) {
    const studentId = enrollment.student?.id;
    if (
      !studentId ||
      enrollment.isDeleted ||
      !isCurrentEnrollmentStatus(enrollment.status)
    ) {
      continue;
    }

    if (!map.has(studentId)) {
      map.set(studentId, enrollment);
    }
  }

  return map;
}
