import type { InterviewItem } from "@/src/features/branch-ops/types";

const EPOCH_GUARD_MS = Date.parse("1970-01-02T00:00:00.000Z");

export function isValidInterviewSchedule(
  scheduledAt?: string | null,
): scheduledAt is string {
  if (!scheduledAt) return false;
  const time = Date.parse(scheduledAt);
  return Number.isFinite(time) && time > EPOCH_GUARD_MS;
}

export function formatInterviewMode(mode?: string | null): string {
  if (mode === "ONLINE") return "Online";
  if (mode === "OFFLINE") return "Offline";
  if (mode === "PHONE") return "Phone";
  return mode || "—";
}

/** Raw interview lifecycle status (SCHEDULED / COMPLETED / …). */
export function formatInterviewStatusLabel(status?: string | null): string {
  if (!status) return "—";
  if (status === "SCHEDULED") return "Scheduled";
  if (status === "COMPLETED") return "Completed";
  if (status === "CANCELLED") return "Cancelled";
  if (status === "NO_SHOW") return "No Show";
  if (status === "ASSIGNED") return "Assigned";
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

/**
 * Workflow status for the Interviews table Status column.
 * Uses Interview.status + Interview.result so final outcomes are not shown as "Completed".
 */
export function formatInterviewWorkflowStatusLabel(
  status?: string | null,
  result?: string | null,
): string {
  const normalizedStatus = (status ?? "").toUpperCase();
  const normalizedResult = (result ?? "").toUpperCase();

  if (normalizedStatus === "SCHEDULED" || normalizedStatus === "ASSIGNED") {
    return "Scheduled";
  }

  if (normalizedStatus === "CANCELLED") {
    return "Cancelled";
  }

  if (normalizedStatus === "NO_SHOW") {
    return "No Show";
  }

  if (normalizedStatus === "COMPLETED") {
    if (normalizedResult === "SELECTED_FOR_NEXT_ROUND") {
      return "In Progress";
    }
    if (normalizedResult === "ON_HOLD") {
      return "On Hold";
    }
    if (normalizedResult === "NEED_FURTHER_REVIEW") {
      return "Needs Review";
    }
    if (normalizedResult === "REJECTED") {
      return "Rejected";
    }
    if (normalizedResult === "PLACED") {
      return "Placed";
    }
    return "Completed";
  }

  return formatInterviewStatusLabel(status);
}

export function getInterviewWorkflowStatusVariant(
  status?: string | null,
  result?: string | null,
): "success" | "warning" | "danger" | "info" | "default" {
  const normalizedStatus = (status ?? "").toUpperCase();
  const normalizedResult = (result ?? "").toUpperCase();

  if (normalizedStatus === "SCHEDULED" || normalizedStatus === "ASSIGNED") {
    return "info";
  }
  if (normalizedStatus === "CANCELLED" || normalizedStatus === "NO_SHOW") {
    return "danger";
  }
  if (normalizedStatus === "COMPLETED") {
    if (normalizedResult === "REJECTED") return "danger";
    if (normalizedResult === "PLACED") return "success";
    if (
      normalizedResult === "SELECTED_FOR_NEXT_ROUND" ||
      normalizedResult === "ON_HOLD" ||
      normalizedResult === "NEED_FURTHER_REVIEW" ||
      normalizedResult === "PENDING" ||
      !normalizedResult
    ) {
      return "warning";
    }
    return "success";
  }
  return "default";
}

export function formatInterviewResult(result?: string | null): string {
  if (!result || result === "PENDING") return "Pending";
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

export function getInterviewResultVariant(
  result?: string | null,
): "success" | "warning" | "danger" | "info" | "default" {
  if (result === "SELECTED_FOR_NEXT_ROUND" || result === "PLACED") return "success";
  if (result === "REJECTED") return "danger";
  if (result === "ON_HOLD" || result === "NEED_FURTHER_REVIEW") return "warning";
  if (!result || result === "PENDING") return "default";
  return "default";
}

export function getInterviewStatusVariant(
  status?: string | null,
): "success" | "warning" | "danger" | "info" | "default" {
  if (status === "COMPLETED") return "success";
  if (status === "SCHEDULED") return "info";
  if (status === "CANCELLED" || status === "NO_SHOW") return "danger";
  if (status === "ASSIGNED") return "warning";
  return "default";
}

export function formatInterviewDate(value?: string | null): string {
  if (!isValidInterviewSchedule(value)) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatInterviewTime(value?: string | null): string {
  if (!isValidInterviewSchedule(value)) return "—";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Relative label from persisted interview datetime (not application date). */
export function getInterviewRelativeLabel(
  scheduledAt?: string | null,
  status?: string | null,
  result?: string | null,
): string {
  const workflow = formatInterviewWorkflowStatusLabel(status, result);
  if (
    workflow === "Rejected" ||
    workflow === "Placed" ||
    workflow === "In Progress" ||
    workflow === "On Hold" ||
    workflow === "Needs Review" ||
    workflow === "Completed" ||
    workflow === "No Show"
  ) {
    return workflow;
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
  const startOfTomorrow = new Date(startOfToday);
  startOfTomorrow.setDate(startOfTomorrow.getDate() + 1);
  const startOfWhen = new Date(when);
  startOfWhen.setHours(0, 0, 0, 0);

  const dayDiff = Math.round(
    (startOfWhen.getTime() - startOfToday.getTime()) / 86_400_000,
  );

  if (dayDiff === 0) {
    return `Today · ${formatInterviewTime(scheduledAt)}`;
  }
  if (dayDiff === 1) {
    return "Tomorrow";
  }
  if (dayDiff > 1) {
    return `${dayDiff} days to go`;
  }
  if (dayDiff === -1) {
    return "1 day ago";
  }
  return `${Math.abs(dayDiff)} days ago`;
}

export function getInterviewerDisplayName(
  interview?: InterviewItem | null,
): string {
  return interview?.interviewer?.name || interview?.interviewer?.email || "—";
}

export function toJobApplicationLike(interview: InterviewItem) {
  return {
    id: interview.applicationId,
    applicationNumber:
      interview.application?.applicationNumber ?? interview.applicationId,
    applicantName: interview.application?.candidateName ?? null,
    applicantEmail: null,
    status: interview.application?.status ?? "INTERVIEW",
    createdAt: interview.scheduledAt ?? new Date().toISOString(),
    job: {
      id: interview.job?.id,
      title: interview.job?.title ?? "—",
      companyName: interview.job?.companyName ?? "—",
    },
    interviewStatus: "INTERVIEW_SCHEDULED",
    interviewScheduledAt: interview.scheduledAt,
    latestInterview: {
      id: interview.id,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      mode: interview.mode,
      locationOrLink: interview.locationOrLink,
      roundId: interview.roundId ?? interview.round?.id ?? null,
      nextRoundId: interview.nextRoundId ?? interview.nextRound?.id ?? null,
      roundNumber: interview.roundNumber ?? 1,
      result: interview.result ?? null,
      status: interview.status,
      notes: interview.notes,
      round: interview.round ?? null,
      nextRound: interview.nextRound ?? null,
      interviewer: interview.interviewer
        ? {
            id: interview.interviewer.id,
            firstName: interview.interviewer.name,
            lastName: null,
            email: interview.interviewer.email,
          }
        : null,
      branch: interview.branch ?? null,
    },
  };
}
