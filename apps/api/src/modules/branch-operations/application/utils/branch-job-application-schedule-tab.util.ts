import {
  InterviewResult,
  InterviewStatus,
  JobApplicationStatus,
} from '@prisma/client';
import {
  isPersistedScheduledInterviewRow,
  resolveApplicationInterviewWorkflow,
} from '@mcj/shared-constants';

import type { BranchJobApplicationInterviewListRow } from './branch-job-application-interview-list.util';

export type BranchJobApplicationScheduleTab =
  | 'NOT_SCHEDULED'
  | 'SCHEDULED'
  | 'FINAL';

const SCHEDULE_EPOCH_GUARD = Date.parse('1970-01-02T00:00:00.000Z');

function compareInterviews(
  left: BranchJobApplicationInterviewListRow,
  right: BranchJobApplicationInterviewListRow,
): number {
  const roundDelta = (right.roundNumber ?? 0) - (left.roundNumber ?? 0);
  if (roundDelta !== 0) {
    return roundDelta;
  }
  return right.createdAt.getTime() - left.createdAt.getTime();
}

export function isPersistedScheduledInterview(
  interview: BranchJobApplicationInterviewListRow,
  now = new Date(),
): boolean {
  if (
    interview.status !== InterviewStatus.SCHEDULED ||
    !interview.scheduledAt ||
    interview.scheduledAt.getTime() <= SCHEDULE_EPOCH_GUARD
  ) {
    return false;
  }
  return isPersistedScheduledInterviewRow(
    {
      id: interview.id,
      status: interview.status,
      result: interview.result,
      scheduledAt: interview.scheduledAt,
      durationMinutes: interview.durationMinutes,
      createdAt: interview.createdAt,
      roundNumber: interview.roundNumber,
    },
    now,
  );
}

/**
 * Tab bucket for Branch-Web Job Applications list.
 * FINAL (Placed/Rejected) appears only on All Applications.
 */
export function classifyBranchJobApplicationScheduleTab(
  interviews: BranchJobApplicationInterviewListRow[],
  applicationStatus: JobApplicationStatus,
): BranchJobApplicationScheduleTab {
  const sorted = [...interviews].sort(compareInterviews);

  if (sorted.length === 0) {
    if (
      applicationStatus === JobApplicationStatus.PLACED ||
      applicationStatus === JobApplicationStatus.REJECTED
    ) {
      return 'FINAL';
    }
    return 'NOT_SCHEDULED';
  }

  const completed = sorted.filter(
    (item) => item.status === InterviewStatus.COMPLETED,
  );
  const latestCompleted = completed[0] ?? null;

  if (latestCompleted) {
    if (
      latestCompleted.result === InterviewResult.PLACED ||
      latestCompleted.result === InterviewResult.REJECTED
    ) {
      return 'FINAL';
    }
  }

  const workflow = resolveApplicationInterviewWorkflow({
    interviews: sorted.map((item) => ({
      id: item.id,
      status: item.status,
      result: item.result,
      scheduledAt: item.scheduledAt,
      durationMinutes: item.durationMinutes,
      createdAt: item.createdAt,
      roundNumber: item.roundNumber,
      round: item.round,
    })),
    applicationStatus,
    now: new Date(),
  });

  if (
    workflow.phase === 'UPCOMING' ||
    workflow.phase === 'TODAY_UPCOMING' ||
    workflow.phase === 'IN_PROGRESS' ||
    workflow.phase === 'EXPIRED'
  ) {
    return 'SCHEDULED';
  }

  if (
    workflow.phase === 'NOT_YET_STARTED' ||
    workflow.phase === 'NOT_SCHEDULED' ||
    workflow.phase === 'WAITING_TO_SCHEDULE' ||
    workflow.phase === 'RESCHEDULE_REQUIRED' ||
    workflow.phase === 'NEXT_ROUND_PENDING'
  ) {
    return 'NOT_SCHEDULED';
  }

  const scheduledActive =
    sorted.find((item) => isPersistedScheduledInterview(item)) ?? null;

  if (scheduledActive) {
    return 'SCHEDULED';
  }

  if (
    applicationStatus === JobApplicationStatus.PLACED ||
    applicationStatus === JobApplicationStatus.REJECTED
  ) {
    return 'FINAL';
  }

  return 'NOT_SCHEDULED';
}
