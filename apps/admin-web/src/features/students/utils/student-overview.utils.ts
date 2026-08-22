import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import { normalizeMoney } from "@/src/features/enrollments/utils/format-payment";
import type { PaymentSummary } from "@/src/features/payments/types/payment.types";

export interface StudentOverviewStats {
  activeBatchCount: number;
  totalEnrollments: number;
  activeCourseCount: number;
  attendancePercent: number | null;
  totalPaid: number;
  pendingDue: number;
}

const ACTIVE_ENROLLMENT_LIMIT = 5;

export function getActiveEnrollments(enrollments: Enrollment[]): Enrollment[] {
  return enrollments.filter(
    (enrollment) => enrollment.isActive && !enrollment.isDeleted,
  );
}

export function computeStudentOverviewStats(
  enrollments: Enrollment[],
  payments: PaymentSummary[],
): StudentOverviewStats {
  const activeEnrollments = getActiveEnrollments(enrollments);
  const batchIds = new Set(
    activeEnrollments.map((enrollment) => enrollment.batch?.id).filter(Boolean),
  );
  const courseIds = new Set(
    activeEnrollments
      .map((enrollment) => enrollment.course?.id)
      .filter(Boolean),
  );

  const enrollmentPaidTotal = enrollments.reduce(
    (sum, enrollment) => sum + normalizeMoney(enrollment.paidAmount),
    0,
  );
  const enrollmentDueTotal = enrollments.reduce(
    (sum, enrollment) => sum + normalizeMoney(enrollment.dueAmount),
    0,
  );

  const successfulPayments = payments.filter(
    (payment) => payment.paymentStatus === "SUCCESS",
  );
  const paymentPaidTotal = successfulPayments.reduce(
    (sum, payment) => sum + normalizeMoney(payment.amount),
    0,
  );

  return {
    activeBatchCount: batchIds.size,
    totalEnrollments: enrollments.filter((enrollment) => !enrollment.isDeleted)
      .length,
    activeCourseCount: courseIds.size,
    attendancePercent: null,
    totalPaid:
      paymentPaidTotal > 0 ? paymentPaidTotal : enrollmentPaidTotal,
    pendingDue: enrollmentDueTotal,
  };
}

export function getOverviewActiveEnrollments(
  enrollments: Enrollment[],
  limit = ACTIVE_ENROLLMENT_LIMIT,
): Enrollment[] {
  return getActiveEnrollments(enrollments).slice(0, limit);
}

export function formatStudentName(
  firstName?: string | null,
  lastName?: string | null,
): string {
  return [firstName, lastName].filter(Boolean).join(" ") || "—";
}

export function getStudentInitials(
  firstName?: string | null,
  lastName?: string | null,
): string {
  const first = firstName?.trim().charAt(0) ?? "";
  const last = lastName?.trim().charAt(0) ?? "";
  const initials = `${first}${last}`.toUpperCase();

  return initials || "ST";
}
