import type { JobApplicationInterviewAssignment } from "@/src/features/student-jobs/types/job-application.types";

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

/** True only when Branch-web has persisted a real schedule (not assignment-only). */
export function hasScheduledInterview(
  assignment?: JobApplicationInterviewAssignment | null,
): assignment is JobApplicationInterviewAssignment {
  if (!assignment) return false;
  if (assignment.status === "ASSIGNED") return false;
  return isValidInterviewSchedule(assignment.scheduledAt);
}

export function formatInterviewMode(mode?: string | null): string {
  if (mode === "ONLINE") return "Online";
  if (mode === "OFFLINE") return "Offline";
  if (mode === "PHONE") return "Phone";
  return mode || "—";
}

export function formatInterviewDate(value?: string | Date | null): string {
  if (!isValidInterviewSchedule(value)) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatInterviewTime(value?: string | Date | null): string {
  if (!isValidInterviewSchedule(value)) return "—";
  return new Date(value).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function getInterviewRelativeLabel(
  scheduledAt?: string | Date | null,
  status?: string | null,
): string {
  if (status === "COMPLETED" || status === "NO_SHOW") {
    return "Completed";
  }
  if (status === "CANCELLED") {
    return "Cancelled";
  }
  if (!isValidInterviewSchedule(scheduledAt)) {
    return "—";
  }

  const when = new Date(scheduledAt);
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const startOfWhen = new Date(when);
  startOfWhen.setHours(0, 0, 0, 0);

  const dayDiff = Math.round(
    (startOfWhen.getTime() - startOfToday.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Tomorrow";
  if (dayDiff > 1) return `${dayDiff} days to go`;
  if (when.getTime() < now.getTime()) return "Completed";
  return "Today";
}

export function formatInterviewerName(
  interviewer?: {
    firstName: string;
    lastName: string | null;
  } | null,
): string | null {
  if (!interviewer) return null;
  const name = [interviewer.firstName, interviewer.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return name || null;
}

export function formatBranchAddress(branch?: {
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
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
