import type {
  JobApplication,
  JobApplicationInterviewAssignment,
} from "@/src/features/student-jobs/types/job-application.types";
import type { JobApplicationInterviewStatus } from "@/src/features/student-jobs/constants/interview-status.constants";
import { isValidInterviewSchedule } from "@/src/features/student-jobs/utils/interview-schedule.utils";

export type CustomerInterviewRow = JobApplicationInterviewAssignment;

function interviewWorkflowRank(interview: CustomerInterviewRow): number {
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

export function getInterviewRoundKey(interview: CustomerInterviewRow): string {
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
  left: CustomerInterviewRow,
  right: CustomerInterviewRow,
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
  left: CustomerInterviewRow,
  right: CustomerInterviewRow,
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

/** Active row for a round (re-schedule / cancel / re-assign aware). */
export function pickPrimaryInterviewForRound(
  records: CustomerInterviewRow[],
): CustomerInterviewRow {
  return [...records].sort(comparePrimaryCandidate)[0];
}

export interface CustomerInterviewTimelineRoundEntry {
  roundKey: string;
  primary: CustomerInterviewRow;
  historical: CustomerInterviewRow[];
}

/** One timeline group per persisted round; superseded rows stay historical. */
export function buildInterviewTimelineByRound(
  interviews: CustomerInterviewRow[],
): CustomerInterviewTimelineRoundEntry[] {
  const groups = new Map<string, CustomerInterviewRow[]>();

  for (const interview of interviews) {
    const key = getInterviewRoundKey(interview);
    const bucket = groups.get(key) ?? [];
    bucket.push(interview);
    groups.set(key, bucket);
  }

  const entries: CustomerInterviewTimelineRoundEntry[] = [];

  for (const [roundKey, records] of groups) {
    const primary = pickPrimaryInterviewForRound(records);
    const historical = records
      .filter((item) => item.id !== primary.id)
      .sort((a, b) => comparePrimaryCandidate(a, b));

    entries.push({ roundKey, primary, historical });
  }

  return entries.sort((a, b) => compareRoundOrder(a.primary, b.primary));
}

/** Current scheduled interview for cards/actions — never a cancelled or completed row. */
export function pickCustomerScheduledInterview(
  application: Pick<
    JobApplication,
    "interviews" | "interviewAssignment"
  >,
): JobApplicationInterviewAssignment | null {
  const interviews = application.interviews ?? [];

  if (interviews.length) {
    const entries = buildInterviewTimelineByRound(interviews);
    const primaries = entries.map((entry) => entry.primary);

    const scheduled = primaries.filter(
      (item) =>
        item.status === "SCHEDULED" &&
        isValidInterviewSchedule(item.scheduledAt),
    );
    if (scheduled.length) {
      return [...scheduled].sort(comparePrimaryCandidate)[0] ?? null;
    }

    return null;
  }

  const assignment = application.interviewAssignment;
  if (
    assignment?.status === "SCHEDULED" &&
    isValidInterviewSchedule(assignment.scheduledAt)
  ) {
    return assignment;
  }

  return null;
}

export function resolveCustomerActiveInterviewAssignment(
  application: Pick<
    JobApplication,
    "interviews" | "interviewAssignment"
  >,
): JobApplicationInterviewAssignment | null {
  return pickCustomerScheduledInterview(application);
}

/** Interview status badge aligned with the current persisted interview row. */
export function resolveCustomerInterviewStatusForDisplay(
  application: Pick<
    JobApplication,
    "interviewStatus" | "interviews" | "interviewAssignment"
  >,
): JobApplicationInterviewStatus {
  if (resolveCustomerActiveInterviewAssignment(application)) {
    return "INTERVIEW_SCHEDULED";
  }

  const raw = (application.interviewStatus ?? "NOT_YET")
    .toString()
    .trim()
    .toUpperCase();

  if (raw === "INTERVIEW_SCHEDULED") {
    return "NOT_YET";
  }

  return (application.interviewStatus ??
    "NOT_YET") as JobApplicationInterviewStatus;
}

export function historicalInterviewStepLabel(
  interview: CustomerInterviewRow,
): string {
  if (interview.status === "CANCELLED") {
    return "Previous schedule — Cancelled";
  }
  return "Previous schedule";
}
