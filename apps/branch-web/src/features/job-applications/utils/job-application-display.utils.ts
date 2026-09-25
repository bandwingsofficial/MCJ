import {
  findActiveScheduledInterview,
  findExpiredScheduledInterview,
} from "@mcj/shared-constants";

import type {
  InterviewItem,
  JobApplicationBranchInterview,
  JobApplicationItem,
} from "@/src/features/branch-ops/types";

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
  const normalized = (status ?? "").toUpperCase();

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

export function formatInterviewResultLabel(result?: string | null): string {
  const normalized = normalizeToken(result);
  switch (normalized) {
    case "SELECTED_FOR_NEXT_ROUND":
      return "Selected for Next Round";
    case "REJECTED":
      return "Rejected";
    case "PLACED":
      return "Placed";
    case "ON_HOLD":
      return "On Hold";
    case "NEED_FURTHER_REVIEW":
      return "Need Further Review";
    case "PENDING":
      return "Pending";
    default:
      return titleCaseWords(normalized.replaceAll("_", " "));
  }
}

function normalizeToken(value?: string | null): string {
  return (value ?? "").toString().trim().toUpperCase();
}

function titleCaseWords(value: string): string {
  if (!value) return "";
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatAppliedDateLine(value?: string | null): string {
  const formatted = formatAppliedDate(value);
  return formatted === "—" ? "—" : `Applied: ${formatted}`;
}

const SCHEDULE_EPOCH_GUARD = Date.parse("1970-01-02T00:00:00.000Z");

export function isPersistedInterviewSchedule(
  scheduledAt?: string | null,
): boolean {
  if (!scheduledAt) return false;
  const time = Date.parse(scheduledAt);
  return Number.isFinite(time) && time > SCHEDULE_EPOCH_GUARD;
}


export function formatInterviewScheduleDate(
  value?: string | null,
): string | null {
  if (!isPersistedInterviewSchedule(value)) return null;
  return new Date(value!).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatInterviewScheduleTime(
  value?: string | null,
): string | null {
  if (!isPersistedInterviewSchedule(value)) return null;
  return new Date(value!).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
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

const SCHEDULE_EPOCH_GUARD_MS = Date.parse("1970-01-02T00:00:00.000Z");

function hasPersistedScheduleAt(value?: string | null): boolean {
  if (!value) return false;
  const ms = Date.parse(value);
  return Number.isFinite(ms) && ms > SCHEDULE_EPOCH_GUARD_MS;
}

/** Interviewer id to send when scheduling (open assignment → latest assigned). */
export function resolveScheduleInterviewerId(
  application: JobApplicationItem,
  roundId?: string,
): string | undefined {
  const interviews = application.branchInterviews ?? [];
  const normalizedRoundId = (roundId ?? "").trim();

  const openForRound = normalizedRoundId
    ? interviews.find(
        (item) =>
          item.status === "ASSIGNED" &&
          item.roundId === normalizedRoundId &&
          !hasPersistedScheduleAt(item.scheduledAt),
      )
    : undefined;

  const openShell = interviews.find(
    (item) =>
      item.status === "ASSIGNED" &&
      !hasPersistedScheduleAt(item.scheduledAt) &&
      !(item.roundId ?? "").trim(),
  );

  const latestWithInterviewer = [...interviews]
    .sort((a, b) => {
      const aTime = Date.parse(a.updatedAt ?? a.createdAt ?? "");
      const bTime = Date.parse(b.updatedAt ?? b.createdAt ?? "");
      return bTime - aTime;
    })
    .find((item) => item.interviewer?.id);

  return (
    openForRound?.interviewer?.id ??
    openShell?.interviewer?.id ??
    latestWithInterviewer?.interviewer?.id ??
    application.latestInterview?.interviewer?.id ??
    undefined
  );
}

export function listBranchApplicationInterviews(
  application: Pick<
    JobApplicationItem,
    "branchInterviews" | "latestInterview"
  >,
  detailInterviews?: JobApplicationBranchInterview[],
): JobApplicationBranchInterview[] {
  if (detailInterviews?.length) {
    return detailInterviews;
  }
  if (application.branchInterviews?.length) {
    return application.branchInterviews;
  }
  if (application.latestInterview) {
    return [application.latestInterview];
  }
  return [];
}

/** Current SCHEDULED row for conduct / interview workspace (never cancelled/history). */
export function pickBranchConductInterview(
  application: Pick<
    JobApplicationItem,
    "branchInterviews" | "latestInterview"
  >,
  detailInterviews?: JobApplicationBranchInterview[],
  nowMs = Date.now(),
): JobApplicationBranchInterview | null {
  const interviews = listBranchApplicationInterviews(
    application,
    detailInterviews,
  );
  const now = new Date(nowMs);
  const active =
    findActiveScheduledInterview(interviews, now) ??
    findExpiredScheduledInterview(interviews, now);
  return (active as JobApplicationBranchInterview | null) ?? null;
}

function pickLatestBranchInterviewByRecency(
  interviews: JobApplicationBranchInterview[],
  statuses: string[],
): JobApplicationBranchInterview | null {
  const matches = interviews.filter((item) =>
    statuses.includes((item.status ?? "").toString().trim().toUpperCase()),
  );
  if (!matches.length) {
    return null;
  }
  return [...matches].sort((left, right) => {
    const leftTime = Date.parse(left.updatedAt ?? left.createdAt ?? "") || 0;
    const rightTime = Date.parse(right.updatedAt ?? right.createdAt ?? "") || 0;
    return rightTime - leftTime;
  })[0];
}

/** Open assignment row, or latest scheduled/completed row (interview results do not unassign). */
export function pickBranchOpenAssignmentInterview(
  interviews: JobApplicationBranchInterview[],
): JobApplicationBranchInterview | null {
  return (
    pickLatestBranchInterviewByRecency(interviews, ["ASSIGNED"]) ??
    pickLatestBranchInterviewByRecency(interviews, ["SCHEDULED"]) ??
    pickLatestBranchInterviewByRecency(interviews, ["COMPLETED"])
  );
}

/** Best interview row for read-only View Interview (same modal as /interviews). */
export function pickBranchApplicationViewInterview(
  application: JobApplicationItem,
): JobApplicationBranchInterview | null {
  const interviews = listBranchApplicationInterviews(application);
  const fromList =
    interviews.length > 0
      ? [...interviews].sort((left, right) => {
          const leftTime =
            Date.parse(left.updatedAt ?? left.createdAt ?? "") || 0;
          const rightTime =
            Date.parse(right.updatedAt ?? right.createdAt ?? "") || 0;
          return rightTime - leftTime;
        })[0]
      : null;

  return (
    pickBranchConductInterview(application, interviews) ??
    pickBranchOpenAssignmentInterview(interviews) ??
    application.latestInterview ??
    fromList
  );
}

export function toInterviewItemFromJobApplication(
  application: JobApplicationItem,
  interview: JobApplicationBranchInterview,
): InterviewItem {
  const interviewerName = getInterviewerName(
    interview as JobApplicationItem["latestInterview"],
  );

  return {
    id: interview.id,
    applicationId: application.id,
    scheduledAt: interview.scheduledAt ?? null,
    durationMinutes: interview.durationMinutes,
    mode: interview.mode ?? null,
    locationOrLink: interview.locationOrLink ?? null,
    notes: interview.notes ?? null,
    evaluation: null,
    status: interview.status,
    roundId: interview.roundId ?? null,
    nextRoundId: interview.nextRoundId ?? null,
    roundNumber: interview.roundNumber,
    result: interview.result ?? null,
    interviewerId: interview.interviewer?.id ?? null,
    round: interview.round ?? null,
    nextRound: interview.nextRound ?? null,
    application: {
      id: application.id,
      applicationNumber: application.applicationNumber,
      candidateName: application.applicantName,
      status: application.status,
    },
    job: application.job?.id
      ? {
          id: application.job.id,
          title: application.job.title,
          companyName: application.job.companyName,
        }
      : undefined,
    interviewer: interview.interviewer?.id
      ? {
          id: interview.interviewer.id,
          name: interviewerName ?? interview.interviewer.email ?? "—",
          email: interview.interviewer.email ?? "",
        }
      : null,
    branch: interview.branch ?? null,
  };
}
