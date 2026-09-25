import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

export function getEnrollmentStatusLabel(enrollment: Enrollment): string {
  switch (enrollment.status) {
    case "ADMITTED":
    case "ACTIVE":
      return "Admitted";
    case "ADVANCED":
      return "Advanced";
    case "PENDING_APPROVAL":
      return "Pending Approval";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
      return enrollment.paymentStatus === "PAID"
        ? "Admitted"
        : "Pending Payment";
    default:
      return enrollment.status.replaceAll("_", " ");
  }
}

export function getEnrollmentPaymentStatusLabel(
  enrollment: Enrollment,
): string {
  if (enrollment.status === "ADVANCED") {
    return "Advance Paid / Due Offline";
  }

  if (enrollment.paymentStatus === "PARTIAL") {
    return "Partially Paid";
  }

  return enrollment.paymentStatus.replaceAll("_", " ");
}

export function isAdvancedEnrollment(enrollment: Enrollment): boolean {
  return enrollment.status === "ADVANCED";
}

export function canPayEnrollmentAdvance(enrollment: Enrollment): boolean {
  return (
    enrollment.status === "PENDING" &&
    enrollment.paymentStatus === "UNPAID" &&
    enrollment.finalAmount > 0
  );
}
