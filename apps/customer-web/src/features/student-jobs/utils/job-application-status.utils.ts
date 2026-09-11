import type { ApplicationStatus } from "@/src/features/student-jobs/types";

export type JobApplicationDisplayStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export function getJobApplicationStatusLabel(
  status: string,
): string {
  if (status === "APPLIED") {
    return "Pending";
  }

  if (status === "REJECTED") {
    return "Rejected";
  }

  if (status === "SELECTED" || status === "PLACED") {
    return "Approved";
  }

  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function getJobApplicationStatusVariant(
  status: string,
): "success" | "warning" | "danger" | "info" | "default" {
  if (status === "REJECTED") {
    return "danger";
  }

  if (status === "SELECTED" || status === "PLACED") {
    return "success";
  }

  if (status === "APPLIED") {
    return "warning";
  }

  const known = status as ApplicationStatus;

  if (known === "SELECTED" || known === "HIRED") {
    return "success";
  }

  if (known === "REJECTED") {
    return "danger";
  }

  if (
    known === "UNDER_REVIEW" ||
    known === "SHORTLISTED" ||
    known === "INTERVIEW_SCHEDULED"
  ) {
    return "warning";
  }

  return "info";
}
