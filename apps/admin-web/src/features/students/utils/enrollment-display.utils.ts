import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";
import {
  formatCurrency,
  normalizeMoney,
} from "@/src/features/enrollments/utils/format-payment";

export function getVisibleEnrollments(enrollments: Enrollment[]): Enrollment[] {
  return enrollments.filter((enrollment) => !enrollment.isDeleted);
}

export function resolveEnrollmentBranchName(
  enrollment: Enrollment,
  branchMap: Record<string, string> = {},
): string {
  return (
    enrollment.branch?.branchName ??
    branchMap[enrollment.branch?.id ?? ""] ??
    "—"
  );
}

export function formatEnrollmentTrainerNames(
  enrollment: Enrollment,
): string {
  const trainers = enrollment.batch?.trainers ?? [];

  if (!trainers.length) {
    return "—";
  }

  return trainers
    .map((trainer) =>
      [trainer.firstName, trainer.lastName].filter(Boolean).join(" "),
    )
    .join(", ");
}

export function formatEnrollmentFinalAmount(enrollment: Enrollment): number {
  const finalAmount = normalizeMoney(enrollment.finalAmount);

  if (finalAmount > 0) {
    return finalAmount;
  }

  const fee = normalizeMoney(enrollment.feeAmount);
  const discount = normalizeMoney(enrollment.discountAmount);

  return Math.max(0, fee - discount);
}

export function formatEnrollmentCategoryName(
  enrollment: Enrollment,
): string {
  return enrollment.category?.name ?? "—";
}

export function formatEnrollmentBatchCode(enrollment: Enrollment): string {
  return enrollment.batch?.code ?? "—";
}

export function formatEnrollmentBatchName(enrollment: Enrollment): string {
  return enrollment.batch?.name ?? "—";
}

export function formatEnrollmentPaidAmount(enrollment: Enrollment): string {
  return formatCurrency(enrollment.paidAmount);
}

export function formatEnrollmentBalance(enrollment: Enrollment): string {
  return formatCurrency(enrollment.dueAmount);
}

export function formatEnrollmentFinalPrice(enrollment: Enrollment): string {
  return formatCurrency(formatEnrollmentFinalAmount(enrollment));
}
