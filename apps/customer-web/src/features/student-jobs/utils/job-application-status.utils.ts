import type { ApplicationStatus } from "@/src/features/student-jobs/types";
import type { JobApplicationInterviewStatus } from "@/src/features/student-jobs/constants/interview-status.constants";

/**
 * Customer-facing application pipeline statuses.
 * Source of truth is JobApplication.status from the API.
 */
export type CustomerApplicationStatusKey =
  | "UNDER_REVIEW"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "SELECTED"
  | "REJECTED";

/**
 * Resolve the customer-facing status key from the persisted JobApplication.status.
 *
 * Notes:
 * - Admin shortlist persists as SHORTLISTED.
 * - Legacy admin "approve" wrote SELECTED before shortlisting existed. Those rows
 *   still have interviewStatus NOT_YET (never entered the interview pipeline), so
 *   they must display as SHORTLISTED — not Selected.
 * - True final selection is SELECTED/PLACED after the interview pipeline
 *   (interviewStatus is no longer NOT_YET).
 */
export function resolveCustomerApplicationStatus(
  status: string,
  interviewStatus?: JobApplicationInterviewStatus | string | null,
): CustomerApplicationStatusKey {
  const normalized = status?.trim().toUpperCase() ?? "";
  const interview = (interviewStatus ?? "NOT_YET").toString().trim().toUpperCase();

  if (normalized === "REJECTED") {
    return "REJECTED";
  }

  if (normalized === "APPLIED" || normalized === "UNDER_REVIEW") {
    return "UNDER_REVIEW";
  }

  if (normalized === "SHORTLISTED" || normalized === "ASSESSMENT") {
    return "SHORTLISTED";
  }

  if (normalized === "INTERVIEW") {
    return "INTERVIEW";
  }

  if (normalized === "SELECTED" || normalized === "PLACED") {
    // Legacy admin-approval SELECTED never entered interview scheduling.
    if (interview === "NOT_YET" || interview === "") {
      return "SHORTLISTED";
    }

    return "SELECTED";
  }

  return "UNDER_REVIEW";
}

const CUSTOMER_STATUS_LABELS: Record<CustomerApplicationStatusKey, string> = {
  UNDER_REVIEW: "Under Review",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview Scheduled",
  SELECTED: "Selected",
  REJECTED: "Rejected",
};

export function getJobApplicationStatusLabel(
  status: string,
  interviewStatus?: JobApplicationInterviewStatus | string | null,
): string {
  return CUSTOMER_STATUS_LABELS[
    resolveCustomerApplicationStatus(status, interviewStatus)
  ];
}

export function getJobApplicationStatusVariant(
  status: string,
  interviewStatus?: JobApplicationInterviewStatus | string | null,
): "success" | "warning" | "danger" | "info" | "default" {
  const key = resolveCustomerApplicationStatus(status, interviewStatus);

  if (key === "REJECTED") {
    return "danger";
  }

  if (key === "SELECTED") {
    return "success";
  }

  if (key === "SHORTLISTED") {
    return "info";
  }

  if (key === "INTERVIEW") {
    return "warning";
  }

  if (key === "UNDER_REVIEW") {
    return "warning";
  }

  const known = status as ApplicationStatus;

  if (known === "SELECTED" || known === "HIRED") {
    return "success";
  }

  return "info";
}

export function isUnderReviewStatus(
  status: string,
  interviewStatus?: JobApplicationInterviewStatus | string | null,
): boolean {
  return (
    resolveCustomerApplicationStatus(status, interviewStatus) === "UNDER_REVIEW"
  );
}

export function isShortlistedStatus(
  status: string,
  interviewStatus?: JobApplicationInterviewStatus | string | null,
): boolean {
  const key = resolveCustomerApplicationStatus(status, interviewStatus);
  return key === "SHORTLISTED" || key === "INTERVIEW";
}

export function canReapplyToJob(status: string): boolean {
  return resolveCustomerApplicationStatus(status) === "REJECTED";
}
