import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import { isValidInterviewSchedule } from "@/src/features/job-applications/utils/interview-schedule.utils";

export type InterviewTimelineRow = NonNullable<
  JobApplication["interviews"]
>[number];

function interviewWorkflowRank(interview: InterviewTimelineRow): number {
  if (
    interview.status === "SCHEDULED" &&
    isValidInterviewSchedule(interview.scheduledAt)
  ) {
    return 50;
  }
  if (interview.status === "ASSIGNED") {
    return 40;
  }
  if (interview.status === "COMPLETED") {
    return 30;
  }
  if (interview.status === "NO_SHOW") {
    return 25;
  }
  if (interview.status === "CANCELLED") {
    return 10;
  }
  return 0;
}

export function getInterviewRoundKey(interview: InterviewTimelineRow): string {
  if (interview.roundId) {
    return `round:${interview.roundId}`;
  }
  const order = interview.round?.sortOrder ?? interview.roundNumber;
  if (order != null) {
    return `order:${order}`;
  }
  return `interview:${interview.id}`;
}

function compareRoundOrder(
  left: InterviewTimelineRow,
  right: InterviewTimelineRow,
): number {
  const sortLeft = left.round?.sortOrder ?? left.roundNumber ?? 0;
  const sortRight = right.round?.sortOrder ?? right.roundNumber ?? 0;
  if (sortLeft !== sortRight) {
    return sortLeft - sortRight;
  }
  const roundNumDelta = (left.roundNumber ?? 0) - (right.roundNumber ?? 0);
  if (roundNumDelta !== 0) {
    return roundNumDelta;
  }
  const leftTime = Date.parse(left.createdAt ?? "") || 0;
  const rightTime = Date.parse(right.createdAt ?? "") || 0;
  return leftTime - rightTime;
}

function comparePrimaryCandidate(
  left: InterviewTimelineRow,
  right: InterviewTimelineRow,
): number {
  const rankDelta =
    interviewWorkflowRank(right) - interviewWorkflowRank(left);
  if (rankDelta !== 0) {
    return rankDelta;
  }
  const leftTime = Date.parse(left.updatedAt ?? left.createdAt ?? "") || 0;
  const rightTime = Date.parse(right.updatedAt ?? right.createdAt ?? "") || 0;
  if (rightTime !== leftTime) {
    return rightTime - leftTime;
  }
  return right.id.localeCompare(left.id);
}

/** Active interview row for a round (reschedule / reassignment aware). */
export function pickPrimaryInterviewForRound(
  records: InterviewTimelineRow[],
): InterviewTimelineRow {
  return [...records].sort(comparePrimaryCandidate)[0];
}

export interface InterviewTimelineRoundEntry {
  roundKey: string;
  primary: InterviewTimelineRow;
  historical: InterviewTimelineRow[];
}

/**
 * One timeline step per configured round order. Superseded rows (e.g. CANCELLED
 * after unassign + new schedule) stay as historical siblings, not duplicate steps.
 */
export function buildInterviewTimelineByRound(
  interviews: InterviewTimelineRow[],
): InterviewTimelineRoundEntry[] {
  const groups = new Map<string, InterviewTimelineRow[]>();

  for (const interview of interviews) {
    const key = getInterviewRoundKey(interview);
    const bucket = groups.get(key) ?? [];
    bucket.push(interview);
    groups.set(key, bucket);
  }

  const entries: InterviewTimelineRoundEntry[] = [];

  for (const [roundKey, records] of groups) {
    const primary = pickPrimaryInterviewForRound(records);
    const historical = records
      .filter((item) => item.id !== primary.id)
      .sort((a, b) => comparePrimaryCandidate(a, b));

    entries.push({ roundKey, primary, historical });
  }

  return entries.sort((a, b) => compareRoundOrder(a.primary, b.primary));
}

export function pickWorkflowActiveInterviewId(
  application: Pick<JobApplication, "interviews" | "interviewAssignment">,
): string | null {
  const entries = buildInterviewTimelineByRound(application.interviews ?? []);
  if (!entries.length) {
    return application.interviewAssignment?.id ?? null;
  }

  const primaries = entries.map((entry) => entry.primary);

  const scheduled = primaries.filter(
    (item) =>
      item.status === "SCHEDULED" &&
      isValidInterviewSchedule(item.scheduledAt),
  );
  if (scheduled.length) {
    return [...scheduled].sort(comparePrimaryCandidate)[0]?.id ?? null;
  }

  const assigned = primaries.filter((item) => item.status === "ASSIGNED");
  if (assigned.length) {
    return [...assigned].sort(comparePrimaryCandidate)[0]?.id ?? null;
  }

  const completed = primaries.filter((item) => item.status === "COMPLETED");
  if (completed.length) {
    return [...completed].sort(comparePrimaryCandidate)[0]?.id ?? null;
  }

  const fallback = [...primaries].sort(comparePrimaryCandidate)[0];
  return fallback?.id ?? application.interviewAssignment?.id ?? null;
}
