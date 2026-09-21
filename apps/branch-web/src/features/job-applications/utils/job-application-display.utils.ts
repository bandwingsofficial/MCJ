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
  if (!interview || interview.status !== "SCHEDULED" || !interview.scheduledAt) {
    return false;
  }
  const time = Date.parse(interview.scheduledAt);
  return Number.isFinite(time) && time > Date.parse("1970-01-02T00:00:00.000Z");
}

export type BranchInterviewDisplayKey =
  | "NOT_YET"
  | "SCHEDULED"
  | "COMPLETED"
  | "SELECTED_FOR_NEXT_ROUND"
  | "REJECTED"
  | "ON_HOLD"
  | "NEED_FURTHER_REVIEW"
  | "PLACED"
  | "CANCELLED"
  | "NO_SHOW";

/** Interview status for Branch Job Applications — from latest Interview status+result. */
export function resolveBranchInterviewDisplay(
  interview?: JobApplicationItem["latestInterview"] | null,
): {
  key: BranchInterviewDisplayKey;
  label: string;
  variant: "success" | "warning" | "danger" | "info" | "default";
} {
  if (!interview) {
    return { key: "NOT_YET", label: "NOT YET", variant: "default" };
  }

  const status = (interview.status ?? "").toString().trim().toUpperCase();
  const result = (interview.result ?? "").toString().trim().toUpperCase();

  if (status === "ASSIGNED") {
    return { key: "NOT_YET", label: "NOT YET", variant: "default" };
  }

  if (status === "SCHEDULED") {
    return { key: "SCHEDULED", label: "SCHEDULED", variant: "info" };
  }

  if (status === "COMPLETED") {
    if (result === "SELECTED_FOR_NEXT_ROUND") {
      return {
        key: "SELECTED_FOR_NEXT_ROUND",
        label: "SELECTED FOR NEXT ROUND",
        variant: "success",
      };
    }
    if (result === "REJECTED") {
      return { key: "REJECTED", label: "REJECTED", variant: "danger" };
    }
    if (result === "ON_HOLD") {
      return { key: "ON_HOLD", label: "ON HOLD", variant: "warning" };
    }
    if (result === "NEED_FURTHER_REVIEW") {
      return {
        key: "NEED_FURTHER_REVIEW",
        label: "NEED FURTHER REVIEW",
        variant: "warning",
      };
    }
    if (result === "PLACED") {
      return { key: "PLACED", label: "PLACED", variant: "success" };
    }
    return { key: "COMPLETED", label: "COMPLETED", variant: "warning" };
  }

  if (status === "CANCELLED") {
    return { key: "CANCELLED", label: "CANCELLED", variant: "danger" };
  }

  if (status === "NO_SHOW") {
    return { key: "NO_SHOW", label: "NO SHOW", variant: "danger" };
  }

  return { key: "NOT_YET", label: "NOT YET", variant: "default" };
}

export function getBranchCurrentRoundLabel(
  application: JobApplicationItem,
): string {
  const name = application.latestInterview?.round?.name?.trim();
  if (name) return name;
  if (application.latestInterview) return "Not Set";
  return "Not Started";
}

export function getBranchNextRoundLabel(
  application: JobApplicationItem,
): string {
  const interview = application.latestInterview;
  if (!interview) return "Not Started";

  const result = (interview.result ?? "").toString().trim().toUpperCase();
  const status = (interview.status ?? "").toString().trim().toUpperCase();

  if (
    result === "REJECTED" ||
    result === "PLACED" ||
    result === "ON_HOLD" ||
    result === "NEED_FURTHER_REVIEW"
  ) {
    return "No Further Round";
  }

  const nextName = interview.nextRound?.name?.trim();
  if (nextName) return nextName;

  if (result === "SELECTED_FOR_NEXT_ROUND") {
    return "Not Set";
  }

  if (
    status === "COMPLETED" ||
    status === "SCHEDULED" ||
    status === "ASSIGNED"
  ) {
    return "Not Set";
  }

  return "Not Set";
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
