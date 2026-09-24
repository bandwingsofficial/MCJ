import {
  findActiveScheduledInterview,
  findExpiredScheduledInterview,
  formatCountdownLeft,
  formatDelayedByLabel,
  formatTodayCountdownLabel,
  parsePersistedScheduleMs,
  resolveApplicationInterviewWorkflow,
  resolveScheduledInterviewLifecycle,
  type InterviewTimelineRow,
  type JobApplicationSchedulingSuggestion,
} from "@mcj/shared-constants";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import {
  formatInterviewScheduleDate,
  formatInterviewScheduleTime,
  getInterviewerName,
} from "@/src/features/job-applications/utils/job-application-display.utils";
import { formatInterviewRoundOrderLabel } from "@/src/features/interviews/utils/interview-round-accent.utils";

export type JobApplicationListPresentation = {
  statusLabel: string;
  statusVariant: "success" | "warning" | "danger" | "info" | "default";
  statusDisplayMode: "badge" | "delay" | "plain";
  scheduleBlocked: boolean;
  scheduleActionLabel: string | null;
  interviewPrimary: string;
  interviewPrimaryRoundId: string | null;
  interviewPrimaryRoundSortOrder: number | null;
  interviewSecondary: string | null;
  interviewTertiary: string | null;
};

type InterviewSnapshot = InterviewTimelineRow & {
  updatedAt?: string | Date | null;
  round?: { name?: string | null; id?: string | null; sortOrder?: number | null } | null;
  nextRound?: { name?: string | null; id?: string | null; sortOrder?: number | null } | null;
  interviewer?: JobApplicationItem["latestInterview"] extends infer T
    ? T extends { interviewer?: infer U }
      ? U
      : null
    : null;
};

function compareInterviewsAsc(
  left: InterviewSnapshot,
  right: InterviewSnapshot,
): number {
  const leftOrder = left.round?.sortOrder ?? left.roundNumber ?? 0;
  const rightOrder = right.round?.sortOrder ?? right.roundNumber ?? 0;
  const roundDelta = leftOrder - rightOrder;
  if (roundDelta !== 0) return roundDelta;
  const leftCreated = left.createdAt ? Date.parse(String(left.createdAt)) : 0;
  const rightCreated = right.createdAt ? Date.parse(String(right.createdAt)) : 0;
  return leftCreated - rightCreated;
}

function compareInterviewsDesc(
  left: InterviewSnapshot,
  right: InterviewSnapshot,
): number {
  return -compareInterviewsAsc(left, right);
}

export function getBranchJobApplicationInterviews(
  application: JobApplicationItem,
): InterviewSnapshot[] {
  if (application.branchInterviews?.length) {
    return [...application.branchInterviews].sort(compareInterviewsDesc);
  }
  if (application.latestInterview) {
    return [application.latestInterview];
  }
  return [];
}

function normalizeToken(value?: string | null): string {
  return (value ?? "").toString().trim().toUpperCase();
}

function formatPersistedDateTime(value?: string | Date | null): string | null {
  if (!value) return null;
  const asString = value instanceof Date ? value.toISOString() : String(value);
  const date = formatInterviewScheduleDate(asString);
  const time = formatInterviewScheduleTime(asString);
  if (date && time) return `${date} · ${time}`;
  return null;
}

function resultRecordedAtMs(interview: InterviewSnapshot): number | null {
  const updated = interview.updatedAt
    ? Date.parse(String(interview.updatedAt))
    : NaN;
  if (Number.isFinite(updated)) return updated;
  const created = interview.createdAt
    ? Date.parse(String(interview.createdAt))
    : NaN;
  return Number.isFinite(created) ? created : null;
}

function toSchedulingSuggestion(
  application: JobApplicationItem,
): JobApplicationSchedulingSuggestion | null {
  const api = application.interviewSchedulingSuggestion;
  if (!api) return null;
  const waitingSinceMs = Date.parse(api.waitingSince);
  if (!Number.isFinite(waitingSinceMs)) return null;
  return {
    roundId: api.roundId,
    roundName: api.roundName,
    waitingSinceMs,
    waitingKind: api.waitingKind,
    previousRoundName: api.previousRoundName ?? null,
    previousRoundClearedAtMs: api.previousRoundClearedAt
      ? Date.parse(api.previousRoundClearedAt)
      : null,
    scheduleActionLabel: api.scheduleActionLabel,
  };
}

function notScheduledWaitingPresentation(
  suggestion: JobApplicationSchedulingSuggestion,
  application: JobApplicationItem,
  nowMs: number,
  options?: { rescheduleRequired?: boolean },
): JobApplicationListPresentation {
  const waitingLine = formatDelayedByLabel(suggestion.waitingSinceMs, nowMs, {
    allowAssignedToday: suggestion.waitingKind === "BRANCH_ASSIGNED",
  });
  const roundSortOrder =
    application.interviewSchedulingSuggestion?.roundSortOrder ?? null;
  const roundPrimaryLabel = formatInterviewRoundOrderLabel({
    sortOrder: roundSortOrder,
    name: suggestion.roundName,
  });

  if (suggestion.waitingKind === "PREVIOUS_ROUND_CLEARED") {
    const clearedAtLine = formatPersistedDateTime(
      new Date(suggestion.waitingSinceMs).toISOString(),
    );
    const previousName = suggestion.previousRoundName ?? "Previous round";
    return {
      statusLabel: waitingLine || "Waiting to schedule",
      statusVariant: "danger",
      statusDisplayMode: "delay",
      scheduleBlocked: false,
      scheduleActionLabel: suggestion.scheduleActionLabel,
      interviewPrimary: roundPrimaryLabel,
      interviewPrimaryRoundId: suggestion.roundId,
      interviewPrimaryRoundSortOrder: roundSortOrder,
      interviewSecondary: clearedAtLine
        ? `${previousName} cleared at:\n${clearedAtLine}`
        : `${previousName} cleared`,
      interviewTertiary: null,
    };
  }

  const assignedAtLine = formatPersistedDateTime(
    new Date(suggestion.waitingSinceMs).toISOString(),
  );

  return {
    statusLabel: options?.rescheduleRequired
      ? "Re-Schedule Required"
      : waitingLine || "Waiting to schedule",
    statusVariant: options?.rescheduleRequired ? "warning" : "danger",
    statusDisplayMode: options?.rescheduleRequired ? "badge" : "delay",
    scheduleBlocked: false,
    scheduleActionLabel: suggestion.scheduleActionLabel,
    interviewPrimary: roundPrimaryLabel,
    interviewPrimaryRoundId: suggestion.roundId,
    interviewPrimaryRoundSortOrder: roundSortOrder,
    interviewSecondary: assignedAtLine
      ? `Assigned At:\n${assignedAtLine}`
      : null,
    interviewTertiary: null,
  };
}

function formatCompletedRoundBlock(interview: InterviewSnapshot): string {
  const roundName = interview.round?.name?.trim() || "Interview";
  const at = formatPersistedDateTime(
    resultRecordedAtMs(interview)
      ? new Date(resultRecordedAtMs(interview)!).toISOString()
      : null,
  );
  const result = normalizeToken(interview.result);

  if (result === "SELECTED_FOR_NEXT_ROUND") {
    return `${roundName} · Cleared${at ? `\nCleared At: ${at}` : ""}`;
  }
  if (result === "REJECTED") {
    return `${roundName} · Rejected${at ? `\nRejected At: ${at}` : ""}`;
  }
  if (result === "PLACED") {
    return `${roundName} · Placed${at ? `\nPlaced At: ${at}` : ""}`;
  }
  if (result === "ON_HOLD") {
    return `${roundName} · On Hold${at ? `\nRecorded At: ${at}` : ""}`;
  }
  if (result === "NEED_FURTHER_REVIEW") {
    return `${roundName} · Need Further Review${at ? `\nRecorded At: ${at}` : ""}`;
  }
  return `${roundName} · Completed${at ? `\nCompleted At: ${at}` : ""}`;
}

function formatScheduledRoundBlock(
  interview: InterviewSnapshot,
  nowMs: number,
): string {
  const roundName = interview.round?.name?.trim() || "Interview";
  const dateTime = formatPersistedDateTime(interview.scheduledAt as string);
  const lifecycle = resolveScheduledInterviewLifecycle({
    status: interview.status,
    result: interview.result,
    scheduledAt: interview.scheduledAt,
    durationMinutes: interview.durationMinutes,
    now: new Date(nowMs),
  });
  const scheduledAtMs = parsePersistedScheduleMs(interview.scheduledAt);
  const interviewerName = getInterviewerName(
    interview as JobApplicationItem["latestInterview"],
  );

  if (lifecycle.phase === "EXPIRED" && scheduledAtMs) {
    return `${roundName}${dateTime ? `\nScheduled At:\n${dateTime}` : ""}\nExpired / Not Taken`;
  }

  const lines = [roundName];
  if (dateTime) lines.push(`Scheduled At:\n${dateTime}`);
  if (interviewerName) lines.push(`Interviewer:\n${interviewerName}`);
  return lines.join("\n");
}

function buildProgressionInterviewLines(
  interviews: InterviewSnapshot[],
  nowMs: number,
  options?: {
    includeScheduled?: InterviewSnapshot | null;
  },
): string[] {
  const completed = interviews
    .filter((item) => normalizeToken(item.status) === "COMPLETED")
    .sort(compareInterviewsAsc);

  const blocks = completed.map((item) => formatCompletedRoundBlock(item));

  const scheduled =
    options?.includeScheduled ??
    findActiveScheduledInterview(interviews, new Date(nowMs)) ??
    findExpiredScheduledInterview(interviews, new Date(nowMs));

  if (scheduled) {
    blocks.push(formatScheduledRoundBlock(scheduled as InterviewSnapshot, nowMs));
  }

  return blocks;
}

function splitBlocksToPresentation(blocks: string[]): Pick<
  JobApplicationListPresentation,
  "interviewPrimary" | "interviewSecondary" | "interviewTertiary"
> {
  if (!blocks.length) {
    return {
      interviewPrimary: "Not Scheduled",
      interviewSecondary: null,
      interviewTertiary: null,
    };
  }

  if (blocks.length === 1) {
    const parts = blocks[0]!.split("\n");
    return {
      interviewPrimary: parts[0] ?? blocks[0]!,
      interviewSecondary: parts.slice(1).join("\n") || null,
      interviewTertiary: null,
    };
  }

  const joined = blocks.join("\n\n");
  return {
    interviewPrimary: blocks[0]!.split("\n")[0] ?? blocks[0]!,
    interviewSecondary: joined,
    interviewTertiary: null,
  };
}

function buildScheduledPresentation(
  interview: InterviewSnapshot,
  workflowPhase: string,
  nowMs: number,
): JobApplicationListPresentation {
  const roundLabel = formatInterviewRoundOrderLabel({
    sortOrder: interview.round?.sortOrder ?? interview.roundNumber ?? null,
    name: interview.round?.name ?? "Interview",
  });
  const dateTime = formatPersistedDateTime(interview.scheduledAt as string);
  const scheduledAtMs = parsePersistedScheduleMs(interview.scheduledAt);
  const lifecycle = resolveScheduledInterviewLifecycle({
    status: interview.status,
    result: interview.result,
    scheduledAt: interview.scheduledAt,
    durationMinutes: interview.durationMinutes,
    now: new Date(nowMs),
  });

  let statusLabel = "Scheduled";
  let statusVariant: JobApplicationListPresentation["statusVariant"] = "default";

  if (workflowPhase === "IN_PROGRESS") {
    statusLabel = "In progress";
  } else if (workflowPhase === "EXPIRED" || lifecycle.phase === "EXPIRED") {
    statusLabel = "Expired";
    statusVariant = "danger";
  } else if (scheduledAtMs) {
    const countdown =
      lifecycle.phase === "TODAY_UPCOMING"
        ? formatTodayCountdownLabel(scheduledAtMs, nowMs)
        : formatCountdownLeft(scheduledAtMs, nowMs);
    if (countdown) {
      statusLabel = countdown;
    }
  }

  return {
    statusLabel,
    statusVariant,
    statusDisplayMode: "delay",
    scheduleBlocked: false,
    scheduleActionLabel: null,
    interviewPrimary: roundLabel,
    interviewPrimaryRoundId: interview.round?.id ?? null,
    interviewPrimaryRoundSortOrder:
      interview.round?.sortOrder ?? interview.roundNumber ?? null,
    interviewSecondary: dateTime ? `Scheduled At: ${dateTime}` : null,
    interviewTertiary: null,
  };
}

export function resolveJobApplicationListPresentation(
  application: JobApplicationItem,
  nowMs = Date.now(),
): JobApplicationListPresentation {
  const interviews = getBranchJobApplicationInterviews(application);
  const workflow = resolveApplicationInterviewWorkflow({
    interviews,
    applicationStatus: application.status,
    applicationCreatedAt: application.createdAt,
    now: new Date(nowMs),
  });
  const focus = workflow.focusInterview as InterviewSnapshot | null;

  const hasActiveSchedule = interviews.some(
    (item) => normalizeToken(item.status) === "SCHEDULED",
  );

  const suggestion = toSchedulingSuggestion(application);

  if (
    (workflow.phase === "NOT_YET_STARTED" ||
      workflow.phase === "NOT_SCHEDULED" ||
      workflow.phase === "WAITING_TO_SCHEDULE" ||
      workflow.phase === "RESCHEDULE_REQUIRED" ||
      workflow.phase === "NEXT_ROUND_PENDING") &&
    !hasActiveSchedule &&
    suggestion
  ) {
    return notScheduledWaitingPresentation(
      suggestion,
      application,
      nowMs,
      { rescheduleRequired: workflow.phase === "RESCHEDULE_REQUIRED" },
    );
  }

  if (
    (workflow.phase === "NOT_YET_STARTED" ||
      workflow.phase === "NOT_SCHEDULED" ||
      workflow.phase === "WAITING_TO_SCHEDULE" ||
      workflow.phase === "RESCHEDULE_REQUIRED") &&
    !hasActiveSchedule
  ) {
    return {
      statusLabel: "Not Yet Started",
      statusVariant: "warning",
      statusDisplayMode: "badge",
      scheduleBlocked: false,
      scheduleActionLabel: null,
      interviewPrimary: "Not Scheduled",
      interviewPrimaryRoundId: null,
      interviewPrimaryRoundSortOrder: null,
      interviewSecondary: null,
      interviewTertiary: null,
    };
  }

  if (workflow.phase === "PLACED" && focus) {
    const roundLabel = formatInterviewRoundOrderLabel({
      sortOrder: focus.round?.sortOrder ?? focus.roundNumber ?? null,
      name: focus.round?.name ?? "Interview",
    });
    return {
      statusLabel: "Placed",
      statusVariant: "success",
      statusDisplayMode: "plain",
      scheduleBlocked: true,
      scheduleActionLabel: null,
      interviewPrimary: roundLabel,
      interviewPrimaryRoundId: focus.round?.id ?? null,
      interviewPrimaryRoundSortOrder:
        focus.round?.sortOrder ?? focus.roundNumber ?? null,
      interviewSecondary: null,
      interviewTertiary: null,
    };
  }

  if (workflow.phase === "REJECTED" && focus) {
    const roundLabel = formatInterviewRoundOrderLabel({
      sortOrder: focus.round?.sortOrder ?? focus.roundNumber ?? null,
      name: focus.round?.name ?? "Interview",
    });
    return {
      statusLabel: "Rejected",
      statusVariant: "danger",
      statusDisplayMode: "plain",
      scheduleBlocked: true,
      scheduleActionLabel: null,
      interviewPrimary: roundLabel,
      interviewPrimaryRoundId: focus.round?.id ?? null,
      interviewPrimaryRoundSortOrder:
        focus.round?.sortOrder ?? focus.roundNumber ?? null,
      interviewSecondary: null,
      interviewTertiary: null,
    };
  }

  if (
    (workflow.phase === "UPCOMING" ||
      workflow.phase === "TODAY_UPCOMING" ||
      workflow.phase === "IN_PROGRESS" ||
      workflow.phase === "EXPIRED") &&
    focus
  ) {
    return buildScheduledPresentation(focus, workflow.phase, nowMs);
  }

  if (workflow.phase === "ON_HOLD" && focus) {
    const roundName = focus.round?.name?.trim() || "Interview";
    return {
      statusLabel: "On Hold",
      statusVariant: "warning",
      statusDisplayMode: "badge",
      scheduleBlocked: false,
      scheduleActionLabel: null,
      interviewPrimaryRoundId: focus.round?.id ?? null,
      interviewPrimaryRoundSortOrder: focus.round?.sortOrder ?? null,
      ...splitBlocksToPresentation(buildProgressionInterviewLines(interviews, nowMs)),
    };
  }

  if (workflow.phase === "NEED_FURTHER_REVIEW" && focus) {
    return {
      statusLabel: "Need Further Review",
      statusVariant: "default",
      statusDisplayMode: "badge",
      scheduleBlocked: false,
      scheduleActionLabel: null,
      interviewPrimaryRoundId: focus.round?.id ?? null,
      interviewPrimaryRoundSortOrder: focus.round?.sortOrder ?? null,
      ...splitBlocksToPresentation(buildProgressionInterviewLines(interviews, nowMs)),
    };
  }

  return {
    statusLabel: "Not Scheduled",
    statusVariant: "warning",
    statusDisplayMode: "badge",
    scheduleBlocked: false,
    scheduleActionLabel: suggestion?.scheduleActionLabel ?? null,
    interviewPrimary: suggestion?.roundName ?? "Not Scheduled",
    interviewPrimaryRoundId: suggestion?.roundId ?? null,
    interviewPrimaryRoundSortOrder:
      application.interviewSchedulingSuggestion?.roundSortOrder ?? null,
    interviewSecondary: null,
    interviewTertiary: null,
  };
}

export function isJobApplicationScheduleBlocked(
  application: JobApplicationItem,
  nowMs = Date.now(),
): boolean {
  return resolveJobApplicationListPresentation(application, nowMs).scheduleBlocked;
}

