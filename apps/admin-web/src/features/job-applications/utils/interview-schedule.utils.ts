import type { JobApplicationBranchInterviewerAssignment } from "@/src/features/job-applications/types/job-application.types";
import { formatCanonicalInterviewerName } from "@/src/features/job-applications/utils/interviewer-display.utils";

const EPOCH_GUARD_MS = Date.parse("1970-01-02T00:00:00.000Z");

export function isValidInterviewSchedule(
  scheduledAt?: string | Date | null,
): scheduledAt is string | Date {
  if (!scheduledAt) return false;
  const time =
    scheduledAt instanceof Date
      ? scheduledAt.getTime()
      : Date.parse(scheduledAt);
  return Number.isFinite(time) && time > EPOCH_GUARD_MS;
}

export function hasScheduledInterview(
  interview?: JobApplicationBranchInterviewerAssignment | null,
): interview is JobApplicationBranchInterviewerAssignment {
  if (!interview) return false;
  if (interview.status !== "SCHEDULED") return false;
  return isValidInterviewSchedule(interview.scheduledAt);
}

/** Join link only for the active scheduled row (never cancelled/historical). */
export function canShowJoinInterviewLink(
  interview: JobApplicationBranchInterviewerAssignment,
  options?: { historical?: boolean; workflowActive?: boolean },
): boolean {
  if (options?.historical) {
    return false;
  }
  if (options?.workflowActive === false) {
    return false;
  }
  if (interview.status !== "SCHEDULED") {
    return false;
  }
  if (!isValidInterviewSchedule(interview.scheduledAt)) {
    return false;
  }
  if (!isOnlineInterviewMode(interview.mode)) {
    return false;
  }
  return Boolean(interview.locationOrLink?.trim());
}

export function formatInterviewModeLabel(mode?: string | null): string | null {
  if (!mode?.trim()) return null;
  if (mode === "ONLINE") return "Online";
  if (mode === "OFFLINE") return "Offline";
  if (mode === "PHONE") return "Phone";
  return mode.trim();
}

export function formatInterviewDateLabel(
  value?: string | Date | null,
): string | null {
  if (!isValidInterviewSchedule(value)) return null;
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatInterviewTimeLabel(
  value?: string | Date | null,
): string | null {
  if (!isValidInterviewSchedule(value)) return null;
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatInterviewDateTimeLabel(
  value?: string | Date | null,
): string | null {
  const date = formatInterviewDateLabel(value);
  const time = formatInterviewTimeLabel(value);
  if (date && time) {
    return `${date} · ${time}`;
  }
  return date || time || null;
}

export function formatInterviewLifecycleStatusLabel(
  status?: string | null,
): string | null {
  if (!status) return null;
  if (status === "SCHEDULED") return "Scheduled";
  if (status === "ASSIGNED") return "Assigned";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "NO_SHOW") return "No Show";
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

export function formatInterviewerName(
  interviewer?: {
    firstName: string;
    lastName: string | null;
    email?: string;
    linkedTrainer?: {
      firstName: string;
      lastName?: string | null;
    } | null;
  } | null,
): string | null {
  if (!interviewer) return null;
  const name = formatCanonicalInterviewerName(interviewer, "");
  return name || null;
}

export function formatBranchAddress(branch?: {
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
} | null): string | null {
  if (!branch) return null;
  const parts = [
    branch.addressLine1,
    branch.addressLine2,
    [branch.city, branch.state].filter(Boolean).join(", "),
    branch.postalCode,
    branch.country,
  ]
    .map((part) => part?.trim())
    .filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : null;
}

export function isOnlineInterviewMode(mode?: string | null): boolean {
  return mode === "ONLINE";
}

export function isOfflineInterviewMode(mode?: string | null): boolean {
  return mode === "OFFLINE";
}

export function formatInterviewResultLabel(
  result?: string | null,
): string | null {
  if (!result || result === "PENDING") return null;
  if (result === "SELECTED_FOR_NEXT_ROUND") return "Selected for Next Round";
  if (result === "REJECTED") return "Rejected";
  if (result === "ON_HOLD") return "On Hold";
  if (result === "NEED_FURTHER_REVIEW") return "Need Further Review";
  if (result === "PLACED") return "Placed";
  return result
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}
