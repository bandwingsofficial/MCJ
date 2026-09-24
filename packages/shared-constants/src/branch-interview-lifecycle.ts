export const BRANCH_OPS_TIME_ZONE = "Asia/Kolkata";

const SCHEDULE_EPOCH_GUARD_MS = Date.parse("1970-01-02T00:00:00.000Z");

export type InterviewScheduleLifecyclePhase =
  | "NONE"
  | "UPCOMING"
  | "TODAY_UPCOMING"
  | "IN_PROGRESS"
  | "EXPIRED";

export type InterviewWorkflowPhase =
  | "NOT_SCHEDULED"
  | "NOT_YET_STARTED"
  | "WAITING_TO_SCHEDULE"
  | "RESCHEDULE_REQUIRED"
  | "UPCOMING"
  | "TODAY_UPCOMING"
  | "IN_PROGRESS"
  | "EXPIRED"
  | "NEXT_ROUND_PENDING"
  | "ROUND_CLEARED"
  | "COMPLETED_PENDING"
  | "ON_HOLD"
  | "NEED_FURTHER_REVIEW"
  | "REJECTED"
  | "PLACED"
  | "CANCELLED"
  | "NO_SHOW";

export const RESCHEDULE_REQUIRED_NOTE = "[RESCHEDULE_REQUIRED]";

export type InterviewTimelineRow = {
  id: string;
  status: string;
  result?: string | null;
  scheduledAt?: Date | string | null;
  durationMinutes?: number | null;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  roundNumber?: number | null;
  roundId?: string | null;
  nextRoundId?: string | null;
  notes?: string | null;
  round?: {
    name?: string | null;
    id?: string | null;
    sortOrder?: number | null;
  } | null;
  nextRound?: {
    name?: string | null;
    id?: string | null;
    sortOrder?: number | null;
  } | null;
};

export function parsePersistedScheduleMs(
  scheduledAt?: Date | string | null,
): number | null {
  if (scheduledAt == null) return null;
  const time =
    scheduledAt instanceof Date
      ? scheduledAt.getTime()
      : Date.parse(String(scheduledAt));
  if (!Number.isFinite(time) || time <= SCHEDULE_EPOCH_GUARD_MS) {
    return null;
  }
  return time;
}

export function calendarDayKey(
  instant: Date,
  timeZone = BRANCH_OPS_TIME_ZONE,
): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(instant);
}

export function isSameCalendarDay(
  left: Date,
  right: Date,
  timeZone = BRANCH_OPS_TIME_ZONE,
): boolean {
  return calendarDayKey(left, timeZone) === calendarDayKey(right, timeZone);
}

export function resolveScheduledInterviewLifecycle(input: {
  status: string;
  result?: string | null;
  scheduledAt?: Date | string | null;
  durationMinutes?: number | null;
  now?: Date;
  timeZone?: string;
}): {
  phase: InterviewScheduleLifecyclePhase;
  scheduledAtMs: number | null;
  inProgressEndsAtMs: number | null;
} {
  const now = input.now ?? new Date();
  const nowMs = now.getTime();
  const timeZone = input.timeZone ?? BRANCH_OPS_TIME_ZONE;
  const status = normalizeToken(input.status);
  const scheduledAtMs = parsePersistedScheduleMs(input.scheduledAt);

  if (
    status === "COMPLETED" ||
    status === "CANCELLED" ||
    status === "NO_SHOW" ||
    status === "ASSIGNED"
  ) {
    return {
      phase: "NONE",
      scheduledAtMs,
      inProgressEndsAtMs: null,
    };
  }

  if (status !== "SCHEDULED" || scheduledAtMs === null) {
    return {
      phase: "NONE",
      scheduledAtMs,
      inProgressEndsAtMs: null,
    };
  }

  const durationMs = Math.max(1, input.durationMinutes ?? 60) * 60_000;
  const inProgressEndsAtMs = scheduledAtMs + durationMs;

  if (nowMs >= inProgressEndsAtMs) {
    return { phase: "EXPIRED", scheduledAtMs, inProgressEndsAtMs };
  }
  if (nowMs >= scheduledAtMs) {
    return { phase: "IN_PROGRESS", scheduledAtMs, inProgressEndsAtMs };
  }
  if (isSameCalendarDay(new Date(scheduledAtMs), now, timeZone)) {
    return { phase: "TODAY_UPCOMING", scheduledAtMs, inProgressEndsAtMs };
  }
  return { phase: "UPCOMING", scheduledAtMs, inProgressEndsAtMs };
}

function normalizeToken(value?: string | null): string {
  return (value ?? "").toString().trim().toUpperCase();
}

function compareTimelineRows(
  left: InterviewTimelineRow,
  right: InterviewTimelineRow,
): number {
  const roundDelta = (right.roundNumber ?? 0) - (left.roundNumber ?? 0);
  if (roundDelta !== 0) return roundDelta;
  const leftCreated = left.createdAt
    ? left.createdAt instanceof Date
      ? left.createdAt.getTime()
      : Date.parse(String(left.createdAt))
    : 0;
  const rightCreated = right.createdAt
    ? right.createdAt instanceof Date
      ? right.createdAt.getTime()
      : Date.parse(String(right.createdAt))
    : 0;
  return rightCreated - leftCreated;
}

export function isPersistedScheduledInterviewRow(
  interview: InterviewTimelineRow,
  now?: Date,
): boolean {
  const lifecycle = resolveScheduledInterviewLifecycle({
    status: interview.status,
    result: interview.result,
    scheduledAt: interview.scheduledAt,
    durationMinutes: interview.durationMinutes,
    now,
  });
  return (
    lifecycle.phase === "UPCOMING" ||
    lifecycle.phase === "TODAY_UPCOMING" ||
    lifecycle.phase === "IN_PROGRESS"
  );
}

export function resolveApplicationInterviewWorkflow(input: {
  interviews: InterviewTimelineRow[];
  applicationStatus?: string | null;
  applicationCreatedAt?: Date | string | null;
  now?: Date;
  timeZone?: string;
}): {
  phase: InterviewWorkflowPhase;
  focusInterview: InterviewTimelineRow | null;
  scheduleLifecycle: InterviewScheduleLifecyclePhase;
} {
  const now = input.now ?? new Date();
  const sorted = [...input.interviews].sort(compareTimelineRows);
  const appStatus = normalizeToken(input.applicationStatus);

  if (sorted.length === 0) {
    if (appStatus === "PLACED") {
      return {
        phase: "PLACED",
        focusInterview: null,
        scheduleLifecycle: "NONE",
      };
    }
    if (appStatus === "REJECTED") {
      return {
        phase: "REJECTED",
        focusInterview: null,
        scheduleLifecycle: "NONE",
      };
    }
    return {
      phase: "NOT_YET_STARTED",
      focusInterview: null,
      scheduleLifecycle: "NONE",
    };
  }

  const completed = sorted.filter(
    (item) => normalizeToken(item.status) === "COMPLETED",
  );
  const latestCompleted = completed[0] ?? null;

  if (latestCompleted) {
    const result = normalizeToken(latestCompleted.result);
    if (result === "PLACED") {
      return {
        phase: "PLACED",
        focusInterview: latestCompleted,
        scheduleLifecycle: "NONE",
      };
    }
    if (result === "REJECTED") {
      return {
        phase: "REJECTED",
        focusInterview: latestCompleted,
        scheduleLifecycle: "NONE",
      };
    }
  }

  const scheduledRows = sorted.filter(
    (item) => normalizeToken(item.status) === "SCHEDULED",
  );

  const scheduledActive =
    scheduledRows.find((row) =>
      isPersistedScheduledInterviewRow(row, now),
    ) ?? null;
  if (scheduledActive) {
    const lifecycle = resolveScheduledInterviewLifecycle({
      status: scheduledActive.status,
      result: scheduledActive.result,
      scheduledAt: scheduledActive.scheduledAt,
      durationMinutes: scheduledActive.durationMinutes,
      now,
      timeZone: input.timeZone,
    });
    const phaseMap: Record<
      InterviewScheduleLifecyclePhase,
      InterviewWorkflowPhase | null
    > = {
      NONE: null,
      UPCOMING: "UPCOMING",
      TODAY_UPCOMING: "TODAY_UPCOMING",
      IN_PROGRESS: "IN_PROGRESS",
      EXPIRED: "EXPIRED",
    };
    const phase = phaseMap[lifecycle.phase];
    if (phase) {
      return {
        phase,
        focusInterview: scheduledActive,
        scheduleLifecycle: lifecycle.phase,
      };
    }
  }

  const scheduledExpired =
    scheduledRows.find((row) => {
      const lifecycle = resolveScheduledInterviewLifecycle({
        status: row.status,
        result: row.result,
        scheduledAt: row.scheduledAt,
        durationMinutes: row.durationMinutes,
        now,
        timeZone: input.timeZone,
      });
      return lifecycle.phase === "EXPIRED";
    }) ?? null;
  if (scheduledExpired) {
    return {
      phase: "EXPIRED",
      focusInterview: scheduledExpired,
      scheduleLifecycle: "EXPIRED",
    };
  }

  if (latestCompleted) {
    const result = normalizeToken(latestCompleted.result);
    if (result === "SELECTED_FOR_NEXT_ROUND") {
      return {
        phase: "NEXT_ROUND_PENDING",
        focusInterview: latestCompleted,
        scheduleLifecycle: "NONE",
      };
    }
    if (result === "ON_HOLD") {
      return {
        phase: "ON_HOLD",
        focusInterview: latestCompleted,
        scheduleLifecycle: "NONE",
      };
    }
    if (result === "NEED_FURTHER_REVIEW") {
      return {
        phase: "NEED_FURTHER_REVIEW",
        focusInterview: latestCompleted,
        scheduleLifecycle: "NONE",
      };
    }
    if (result === "PENDING" || !result) {
      return {
        phase: "COMPLETED_PENDING",
        focusInterview: latestCompleted,
        scheduleLifecycle: "NONE",
      };
    }
  }

  const assigned =
    sorted.find((item) => normalizeToken(item.status) === "ASSIGNED") ?? null;
  if (assigned) {
    const notes = (assigned.notes ?? "").toString();
    const hasRound = Boolean(assigned.roundId ?? assigned.round?.id);
    if (notes.includes(RESCHEDULE_REQUIRED_NOTE) || hasRound) {
      return {
        phase: notes.includes(RESCHEDULE_REQUIRED_NOTE)
          ? "RESCHEDULE_REQUIRED"
          : "WAITING_TO_SCHEDULE",
        focusInterview: assigned,
        scheduleLifecycle: "NONE",
      };
    }
    return {
      phase: "WAITING_TO_SCHEDULE",
      focusInterview: assigned,
      scheduleLifecycle: "NONE",
    };
  }

  if (appStatus === "PLACED") {
    return {
      phase: "PLACED",
      focusInterview: latestCompleted,
      scheduleLifecycle: "NONE",
    };
  }
  if (appStatus === "REJECTED") {
    return {
      phase: "REJECTED",
      focusInterview: latestCompleted,
      scheduleLifecycle: "NONE",
    };
  }

  return {
    phase: "NOT_YET_STARTED",
    focusInterview: null,
    scheduleLifecycle: "NONE",
  };
}

export function findLatestClearedRoundInterview(
  interviews: InterviewTimelineRow[],
): InterviewTimelineRow | null {
  const sorted = [...interviews].sort(compareTimelineRows);
  return (
    sorted.find(
      (item) =>
        normalizeToken(item.status) === "COMPLETED" &&
        normalizeToken(item.result) === "SELECTED_FOR_NEXT_ROUND",
    ) ?? null
  );
}

export function findActiveScheduledInterview(
  interviews: InterviewTimelineRow[],
  now?: Date,
): InterviewTimelineRow | null {
  const sorted = [...interviews].sort(compareTimelineRows);
  return (
    sorted.find((row) => {
      if (normalizeToken(row.status) !== "SCHEDULED") return false;
      return isPersistedScheduledInterviewRow(row, now);
    }) ?? null
  );
}

export function findExpiredScheduledInterview(
  interviews: InterviewTimelineRow[],
  now?: Date,
): InterviewTimelineRow | null {
  const sorted = [...interviews].sort(compareTimelineRows);
  return (
    sorted.find((row) => {
      if (normalizeToken(row.status) !== "SCHEDULED") return false;
      const lifecycle = resolveScheduledInterviewLifecycle({
        status: row.status,
        result: row.result,
        scheduledAt: row.scheduledAt,
        durationMinutes: row.durationMinutes,
        now,
      });
      return lifecycle.phase === "EXPIRED";
    }) ?? null
  );
}

export function formatCountdownLeft(
  targetMs: number,
  nowMs: number,
): string | null {
  const countdown = formatCountdownUntil(targetMs, nowMs);
  return countdown ? `${countdown} left` : null;
}

export function formatCountdownUntil(
  targetMs: number,
  nowMs: number,
): string | null {
  if (!Number.isFinite(targetMs) || targetMs <= nowMs) {
    return null;
  }
  let diffMs = targetMs - nowMs;
  const dayMs = 86_400_000;
  const hourMs = 3_600_000;
  const minuteMs = 60_000;

  const days = Math.floor(diffMs / dayMs);
  if (days >= 2) return `${days} days`;
  if (days === 1) return "1 day";

  diffMs -= days * dayMs;
  const hours = Math.floor(diffMs / hourMs);
  if (hours >= 2) return `${hours} hours`;
  if (hours === 1) return "1 hour";

  diffMs -= hours * hourMs;
  const minutes = Math.floor(diffMs / minuteMs);
  if (minutes >= 2) return `${minutes} minutes`;
  return "1 minute";
}

export function formatDelayedByLabel(
  fromMs: number,
  nowMs: number,
  options?: { allowAssignedToday?: boolean },
): string {
  if (!Number.isFinite(fromMs) || fromMs > nowMs) {
    return "";
  }
  const allowAssignedToday = options?.allowAssignedToday ?? true;

  let diffMs = nowMs - fromMs;
  const dayMs = 86_400_000;
  const hourMs = 3_600_000;
  const minuteMs = 60_000;

  const days = Math.floor(diffMs / dayMs);
  if (days >= 1) {
    diffMs -= days * dayMs;
    const hours = Math.floor(diffMs / hourMs);
    if (hours >= 1) {
      const dayPart = days === 1 ? "1 day" : `${days} days`;
      const hourPart = hours === 1 ? "1 hour" : `${hours} hours`;
      return `Delayed by ${dayPart} ${hourPart}`;
    }
    if (days >= 2) return `Delayed by ${days} days`;
    return "Delayed by 1 day";
  }

  if (
    allowAssignedToday &&
    isSameCalendarDay(new Date(fromMs), new Date(nowMs))
  ) {
    return "Assigned today";
  }

  const hours = Math.floor(diffMs / hourMs);
  if (hours >= 2) return `Delayed by ${hours} hours`;
  if (hours === 1) return "Delayed by 1 hour";

  diffMs -= hours * hourMs;
  const minutes = Math.floor(diffMs / minuteMs);
  if (minutes >= 2) return `Delayed by ${minutes} minutes`;
  if (minutes === 1) return "Delayed by 1 minute";

  return allowAssignedToday ? "Assigned today" : "Delayed by 1 minute";
}

export function formatRelativePast(fromMs: number, nowMs: number): string {
  if (!Number.isFinite(fromMs) || fromMs > nowMs) {
    return "";
  }
  let diffMs = nowMs - fromMs;
  const dayMs = 86_400_000;
  const hourMs = 3_600_000;
  const minuteMs = 60_000;

  const days = Math.floor(diffMs / dayMs);
  if (days >= 2) return `${days} days ago`;
  if (days === 1) return "1 day ago";

  diffMs -= days * dayMs;
  const hours = Math.floor(diffMs / hourMs);
  if (hours >= 2) return `${hours} hours ago`;
  if (hours === 1) return "1 hour ago";

  diffMs -= hours * hourMs;
  const minutes = Math.floor(diffMs / minuteMs);
  if (minutes >= 2) return `${minutes} minutes ago`;
  if (minutes === 1) return "1 minute ago";
  return "just now";
}

export function formatTodayCountdownLabel(
  targetMs: number,
  nowMs: number,
): string | null {
  const countdown = formatCountdownUntil(targetMs, nowMs);
  if (!countdown) return null;
  if (countdown.includes("hour") || countdown.includes("minute")) {
    return `Today · ${countdown.replace(" hours", " hr").replace(" hour", " hr").replace(" minutes", " min").replace(" minute", " min")}`;
  }
  return `Today · ${countdown}`;
}

export type BranchInterviewWorkflowAlert = {
  key: string;
  message: string;
  severity: "info" | "warning";
};

export type BranchInterviewWorkflowMetrics = {
  notScheduled: number;
  waitingToSchedule: number;
  scheduledUpcoming: number;
  today: number;
  inProgress: number;
  expired: number;
  nextRoundPending: number;
  completedPending: number;
  placed: number;
  rejected: number;
  onHold: number;
  needFurtherReview: number;
};

export function buildBranchInterviewWorkflowAlerts(
  metrics: BranchInterviewWorkflowMetrics,
): BranchInterviewWorkflowAlert[] {
  const alerts: BranchInterviewWorkflowAlert[] = [];

  if (metrics.waitingToSchedule > 0 || metrics.notScheduled > 0) {
    const count = metrics.waitingToSchedule + metrics.notScheduled;
    alerts.push({
      key: "waiting-scheduling",
      message: `${count} application${count === 1 ? " is" : "s are"} waiting for interview scheduling`,
      severity: "info",
    });
  }
  if (metrics.today > 0) {
    alerts.push({
      key: "today",
      message: `${metrics.today} interview${metrics.today === 1 ? " is" : "s are"} scheduled today`,
      severity: "info",
    });
  }
  if (metrics.scheduledUpcoming > 0) {
    alerts.push({
      key: "approaching",
      message: `${metrics.scheduledUpcoming} upcoming interview${metrics.scheduledUpcoming === 1 ? "" : "s"} on the calendar`,
      severity: "info",
    });
  }
  if (metrics.expired > 0) {
    alerts.push({
      key: "expired",
      message: `${metrics.expired} interview${metrics.expired === 1 ? " has" : "s have"} expired without a result`,
      severity: "warning",
    });
  }
  if (metrics.nextRoundPending > 0) {
    alerts.push({
      key: "next-round",
      message: `${metrics.nextRoundPending} cleared round${metrics.nextRoundPending === 1 ? "" : "s"} — next round needs scheduling`,
      severity: "warning",
    });
  }

  return alerts;
}
