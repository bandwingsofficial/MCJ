import {
  RESCHEDULE_REQUIRED_NOTE,
  resolveApplicationInterviewWorkflow,
  type InterviewTimelineRow,
} from "./branch-interview-lifecycle.js";

export type ActiveInterviewRoundConfig = {
  id: string;
  name: string;
  sortOrder: number;
  status?: string | null;
};

export type JobApplicationSchedulingWaitingKind =
  | "BRANCH_ASSIGNED"
  | "PREVIOUS_ROUND_CLEARED"
  | "RESCHEDULE";

export type JobApplicationSchedulingSuggestion = {
  roundId: string;
  roundName: string;
  waitingSinceMs: number;
  waitingKind: JobApplicationSchedulingWaitingKind;
  previousRoundName: string | null;
  previousRoundClearedAtMs: number | null;
  scheduleActionLabel: string;
};

function normalizeToken(value?: string | null): string {
  return (value ?? "").toString().trim().toUpperCase();
}

function isActiveRound(round: ActiveInterviewRoundConfig): boolean {
  const status = normalizeToken(round.status);
  return !status || status === "ACTIVE";
}

function sortActiveRounds(
  rounds: ActiveInterviewRoundConfig[],
): ActiveInterviewRoundConfig[] {
  return [...rounds]
    .filter(isActiveRound)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function parseMs(value?: Date | string | null): number | null {
  if (value == null) return null;
  const ms =
    value instanceof Date ? value.getTime() : Date.parse(String(value));
  return Number.isFinite(ms) ? ms : null;
}

function resultRecordedAtMs(interview: InterviewTimelineRow): number | null {
  const updated = parseMs(
    (interview as InterviewTimelineRow & { updatedAt?: string | null })
      .updatedAt,
  );
  if (updated != null) return updated;
  return parseMs(interview.createdAt);
}

function findRoundById(
  rounds: ActiveInterviewRoundConfig[],
  roundId?: string | null,
): ActiveInterviewRoundConfig | null {
  if (!roundId) return null;
  return rounds.find((item) => item.id === roundId) ?? null;
}

function resolveNextActiveRoundAfter(
  activeRounds: ActiveInterviewRoundConfig[],
  afterSortOrder: number,
  excludeRoundId?: string | null,
): ActiveInterviewRoundConfig | null {
  return (
    activeRounds.find(
      (item) =>
        item.sortOrder > afterSortOrder &&
        item.id !== excludeRoundId &&
        isActiveRound(item),
    ) ?? null
  );
}

function resolveRoundToSchedule(
  activeRounds: ActiveInterviewRoundConfig[],
  interviews: InterviewTimelineRow[],
  focus: InterviewTimelineRow | null,
  phase: string,
): ActiveInterviewRoundConfig | null {
  const sortedActive = sortActiveRounds(activeRounds);
  if (!sortedActive.length) return null;

  if (phase === "RESCHEDULE_REQUIRED" || phase === "WAITING_TO_SCHEDULE") {
    const focusRoundId = focus?.roundId ?? focus?.round?.id ?? null;
    if (focusRoundId) {
      const configured = findRoundById(sortedActive, focusRoundId);
      if (configured) return configured;
      const fromInterview = focus?.round;
      if (fromInterview?.id && fromInterview.name) {
        return {
          id: fromInterview.id,
          name: fromInterview.name,
          sortOrder: fromInterview.sortOrder ?? 0,
          status: "ACTIVE",
        };
      }
    }
    return sortedActive[0] ?? null;
  }

  if (phase === "NEXT_ROUND_PENDING" && focus) {
    const persistedNextId = focus.nextRoundId ?? focus.nextRound?.id ?? null;
    if (persistedNextId) {
      const persisted = findRoundById(sortedActive, persistedNextId);
      if (persisted) return persisted;
      const fromInterview = focus.nextRound;
      if (fromInterview?.id && fromInterview.name) {
        return {
          id: fromInterview.id,
          name: fromInterview.name,
          sortOrder: fromInterview.sortOrder ?? Number.MAX_SAFE_INTEGER,
          status: "ACTIVE",
        };
      }
    }

    const currentSortOrder =
      focus.round?.sortOrder ??
      findRoundById(sortedActive, focus.roundId)?.sortOrder ??
      0;
    return resolveNextActiveRoundAfter(
      sortedActive,
      currentSortOrder,
      focus.roundId ?? focus.round?.id,
    );
  }

  const openAssigned =
    interviews.find(
      (item) =>
        normalizeToken(item.status) === "ASSIGNED" &&
        (item.roundId || item.round?.id),
    ) ?? null;
  if (openAssigned) {
    const roundId = openAssigned.roundId ?? openAssigned.round?.id ?? null;
    const configured = findRoundById(sortedActive, roundId);
    if (configured) return configured;
    if (openAssigned.round?.id && openAssigned.round.name) {
      return {
        id: openAssigned.round.id,
        name: openAssigned.round.name,
        sortOrder: openAssigned.round.sortOrder ?? 0,
        status: "ACTIVE",
      };
    }
  }

  return sortedActive[0] ?? null;
}

export function resolveJobApplicationSchedulingSuggestion(input: {
  activeRounds: ActiveInterviewRoundConfig[];
  interviews: InterviewTimelineRow[];
  applicationStatus?: string | null;
  branchAssignedAt?: string | null;
  now?: Date;
}): JobApplicationSchedulingSuggestion | null {
  const interviews = input.interviews ?? [];
  const workflow = resolveApplicationInterviewWorkflow({
    interviews,
    applicationStatus: input.applicationStatus,
    now: input.now,
  });
  const phase = workflow.phase;
  const focus = workflow.focusInterview;

  if (
    phase === "PLACED" ||
    phase === "REJECTED" ||
    phase === "ON_HOLD" ||
    phase === "NEED_FURTHER_REVIEW" ||
    phase === "COMPLETED_PENDING"
  ) {
    return null;
  }

  if (
    phase === "UPCOMING" ||
    phase === "TODAY_UPCOMING" ||
    phase === "IN_PROGRESS"
  ) {
    return null;
  }

  const round = resolveRoundToSchedule(
    input.activeRounds,
    interviews,
    focus,
    phase,
  );
  if (!round) return null;

  if (phase === "NEXT_ROUND_PENDING" && focus) {
    const clearedAtMs = resultRecordedAtMs(focus);
    if (clearedAtMs == null) return null;
    const previousRoundName = focus.round?.name?.trim() || "Previous round";
    return {
      roundId: round.id,
      roundName: round.name,
      waitingSinceMs: clearedAtMs,
      waitingKind: "PREVIOUS_ROUND_CLEARED",
      previousRoundName,
      previousRoundClearedAtMs: clearedAtMs,
      scheduleActionLabel: `Schedule ${round.name}`,
    };
  }

  const assignedMs = parseMs(input.branchAssignedAt);
  const focusCreatedMs = focus ? parseMs(focus.createdAt) : null;
  const waitingSinceMs =
    phase === "RESCHEDULE_REQUIRED"
      ? focusCreatedMs ?? assignedMs
      : assignedMs ?? focusCreatedMs;

  if (waitingSinceMs == null) return null;

  const waitingKind: JobApplicationSchedulingWaitingKind =
    phase === "RESCHEDULE_REQUIRED" ? "RESCHEDULE" : "BRANCH_ASSIGNED";

  return {
    roundId: round.id,
    roundName: round.name,
    waitingSinceMs,
    waitingKind,
    previousRoundName: null,
    previousRoundClearedAtMs: null,
    scheduleActionLabel: `Schedule ${round.name}`,
  };
}

export function isRescheduleRequiredInterview(
  interview: InterviewTimelineRow | null | undefined,
): boolean {
  if (!interview) return false;
  const notes = (interview.notes ?? "").toString();
  return notes.includes(RESCHEDULE_REQUIRED_NOTE);
}
