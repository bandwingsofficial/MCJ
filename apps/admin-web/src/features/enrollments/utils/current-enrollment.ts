import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { EnrollmentStatus } from "@/src/features/enrollments/types/enrollment.enums";

export const CURRENT_ENROLLMENT_STATUSES = [
  "PENDING",
  "PENDING_APPROVAL",
  "ADVANCED",
  "ADMITTED",
  "ACTIVE",
] as const;

const TERMINAL_ENROLLMENT_STATUSES = [
  "COMPLETED",
  "CANCELLED",
  "DROPPED",
  "REJECTED",
] as const;

export function normalizeEnrollmentStatus(
  status?: string | null,
): string | null {
  if (status == null || String(status).trim() === "") {
    return null;
  }

  return String(status).toUpperCase().trim();
}

export function isCurrentEnrollmentStatus(status?: string | null): boolean {
  const normalized = normalizeEnrollmentStatus(status);
  if (!normalized) {
    return false;
  }

  return CURRENT_ENROLLMENT_STATUSES.includes(
    normalized as (typeof CURRENT_ENROLLMENT_STATUSES)[number],
  );
}

export function isTerminalEnrollmentStatus(status?: string | null): boolean {
  const normalized = normalizeEnrollmentStatus(status);
  if (!normalized) {
    return false;
  }

  return TERMINAL_ENROLLMENT_STATUSES.includes(
    normalized as (typeof TERMINAL_ENROLLMENT_STATUSES)[number],
  );
}

export function isArchivedEnrollment(enrollment: {
  isDeleted?: boolean;
  deletedAt?: string | null;
}): boolean {
  return Boolean(enrollment.isDeleted || enrollment.deletedAt);
}

/** Status for list UI — never infer Cancelled from isActive alone (inactive ≠ unenrolled). */
export function enrollmentListDisplayStatus(
  enrollment: Pick<Enrollment, "status">,
): EnrollmentStatus {
  const normalized = normalizeEnrollmentStatus(enrollment.status);
  if (normalized) {
    return normalized as EnrollmentStatus;
  }
  return EnrollmentStatus.PENDING;
}

/** Matches backend Enrollment.isCurrent() for list/manage action visibility. */
export function isCurrentEnrollmentRecord(enrollment: {
  status?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
}): boolean {
  if (isArchivedEnrollment(enrollment)) {
    return false;
  }

  const status = normalizeEnrollmentStatus(enrollment.status);
  if (!status) {
    return true;
  }

  return isCurrentEnrollmentStatus(status);
}

/** Edit from list: non-archived and not in a terminal lifecycle state. */
export function canEditEnrollmentFromList(enrollment: {
  status?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
}): boolean {
  if (isArchivedEnrollment(enrollment)) {
    return false;
  }

  const status = normalizeEnrollmentStatus(enrollment.status);
  if (!status) {
    return true;
  }

  return !isTerminalEnrollmentStatus(status);
}

export function canUnenrollEnrollment(enrollment: {
  status?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
}): boolean {
  return isCurrentEnrollmentRecord(enrollment);
}

export function canArchiveEnrollmentFromList(enrollment: {
  status?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
}): boolean {
  return isCurrentEnrollmentRecord(enrollment);
}

export function canPermanentlyDeleteEnrollmentFromList(enrollment: {
  status?: string | null;
  isDeleted?: boolean;
  deletedAt?: string | null;
}): boolean {
  if (isArchivedEnrollment(enrollment)) {
    return true;
  }

  return isTerminalEnrollmentStatus(enrollment.status);
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
      !isCurrentEnrollmentRecord(enrollment)
    ) {
      continue;
    }

    if (!map.has(studentId)) {
      map.set(studentId, enrollment);
    }
  }

  return map;
}
