import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import type { BranchJobApplicationStatus } from "@/src/features/job-applications/constants/job-application.constants";

export function formatApplicationStatusLabel(status?: string | null): string {
  if (!status) return "—";
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function getApplicationStatusVariant(
  status?: string | null,
): "success" | "warning" | "danger" | "info" | "default" {
  const normalized = (status ?? "").toUpperCase() as BranchJobApplicationStatus;

  if (normalized === "REJECTED") return "danger";
  if (normalized === "SELECTED" || normalized === "PLACED") return "success";
  if (normalized === "ASSESSMENT") return "warning";
  if (normalized === "SHORTLISTED" || normalized === "INTERVIEW") return "info";
  return "default";
}

export function getInterviewerName(
  interview?: JobApplicationItem["latestInterview"],
): string | null {
  if (!interview?.interviewer) return null;
  const name = [
    interview.interviewer.firstName,
    interview.interviewer.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || interview.interviewer.email || null;
}

export function isInterviewScheduled(
  interview?:
    | JobApplicationItem["latestInterview"]
    | {
        status?: string | null;
        scheduledAt?: string | null;
      }
    | null,
): boolean {
  return Boolean(
    interview &&
      interview.status === "SCHEDULED" &&
      interview.scheduledAt,
  );
}

export function formatAppliedDate(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatInterviewDateTime(value?: string | null): string {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatInterviewMode(mode?: string | null): string | null {
  if (!mode) return null;
  if (mode === "ONLINE") return "Online";
  if (mode === "OFFLINE") return "Offline";
  if (mode === "PHONE") return "Phone";
  return mode;
}
