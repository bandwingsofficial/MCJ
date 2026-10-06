import type { Enrollment } from "@/src/features/enrollments/types/enrollment.types";

export function getEnrollmentStatusLabel(enrollment: Enrollment): string {
  switch (enrollment.status) {
    case "JOINED":
    case "ACTIVE":
      return "Joined";
    case "ENROLLED":
      return "Enrolled";
    case "PENDING_APPROVAL":
      return "Pending Approval";
    case "REJECTED":
      return "Rejected";
    case "PENDING":
      return enrollment.paymentStatus === "PAID"
        ? "Joined"
        : "Pending Payment";
    default:
      return enrollment.status.replaceAll("_", " ");
  }
}

export function getEnrollmentPaymentStatusLabel(
  enrollment: Enrollment,
): string {
  if (enrollment.status === "ENROLLED") {
    return "Advance Paid / Due Offline";
  }

  if (enrollment.paymentStatus === "PARTIAL") {
    return "Partially Paid";
  }

  return enrollment.paymentStatus.replaceAll("_", " ");
}

/** @deprecated Use isEnrolledStatusEnrollment */
export function isAdvancedEnrollment(enrollment: Enrollment): boolean {
  return isEnrolledStatusEnrollment(enrollment);
}

export function isEnrolledStatusEnrollment(enrollment: Enrollment): boolean {
  return enrollment.status === "ENROLLED";
}

export function canPayEnrollmentAdvance(enrollment: Enrollment): boolean {
  return (
    enrollment.status === "PENDING" &&
    enrollment.paymentStatus === "UNPAID" &&
    enrollment.finalAmount > 0
  );
}
