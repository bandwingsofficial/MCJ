import { InterviewStatus, type Prisma } from '@prisma/client';

import type { BranchJobApplicationInterviewListRow } from './branch-job-application-interview-list.util';

/** Admin branch/interviewer assignment is persisted on open ASSIGNED/SCHEDULED rows. */
export const CURRENT_BRANCH_ASSIGNMENT_STATUSES: InterviewStatus[] = [
  InterviewStatus.ASSIGNED,
  InterviewStatus.SCHEDULED,
];

export function buildCurrentBranchAssignmentInterviewScope(input: {
  branchId: string;
  interviewerId?: string;
  roundId?: string;
}): Prisma.InterviewWhereInput {
  return {
    branchId: input.branchId,
    status: { in: CURRENT_BRANCH_ASSIGNMENT_STATUSES },
    ...(input.interviewerId ? { interviewerId: input.interviewerId } : {}),
    ...(input.roundId ? { roundId: input.roundId } : {}),
  };
}

/** Non-cancelled branch interviews (includes COMPLETED / NO_SHOW; excludes admin unassign). */
export function buildBranchApplicationInterviewIncludeScope(input: {
  branchId: string;
  interviewerId?: string;
}): Prisma.InterviewWhereInput {
  return {
    branchId: input.branchId,
    status: { not: InterviewStatus.CANCELLED },
    ...(input.interviewerId ? { interviewerId: input.interviewerId } : {}),
  };
}

/**
 * Which Job Applications appear in Branch-Web → Job Applications.
 * Must not require open ASSIGNED/SCHEDULED rows — completed interview results stay listed.
 */
export function buildBranchJobApplicationListInterviewScope(input: {
  branchId: string;
  interviewerId?: string;
  roundId?: string;
}): Prisma.InterviewWhereInput {
  const base: Prisma.InterviewWhereInput = {
    branchId: input.branchId,
    status: { not: InterviewStatus.CANCELLED },
    ...(input.interviewerId ? { interviewerId: input.interviewerId } : {}),
  };

  if (!input.roundId) {
    return base;
  }

  return {
    ...base,
    OR: [{ roundId: input.roundId }, { nextRoundId: input.roundId }],
  };
}

const SCHEDULE_EPOCH_GUARD = Date.parse('1970-01-02T00:00:00.000Z');

function hasPersistedSchedule(scheduledAt: Date | null): boolean {
  if (!scheduledAt) return false;
  return scheduledAt.getTime() > SCHEDULE_EPOCH_GUARD;
}

/**
 * When Admin assigns a branch (+ interviewer), an Interview row is created with ASSIGNED.
 * Use the earliest relevant createdAt as the branch assignment timestamp.
 */
export function resolveBranchAssignedAt(
  interviews: BranchJobApplicationInterviewListRow[],
): Date | null {
  if (!interviews.length) {
    return null;
  }

  const assignedAwaitingSchedule = interviews
    .filter(
      (item) =>
        item.status === InterviewStatus.ASSIGNED &&
        !hasPersistedSchedule(item.scheduledAt),
    )
    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

  if (assignedAwaitingSchedule.length) {
    return assignedAwaitingSchedule[0]!.createdAt;
  }

  const sorted = [...interviews].sort(
    (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
  );
  return sorted[0]?.createdAt ?? null;
}
