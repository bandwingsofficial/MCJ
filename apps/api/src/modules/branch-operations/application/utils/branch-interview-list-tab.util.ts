import {
  InterviewResult,
  InterviewStatus,
} from '@prisma/client';
import {
  isSameCalendarDay,
  resolveApplicationInterviewWorkflow,
  resolveScheduledInterviewLifecycle,
  type InterviewTimelineRow,
} from '@mcj/shared-constants';

export type BranchInterviewListTab =
  | 'UPCOMING'
  | 'TODAY'
  | 'IN_PROGRESS'
  | 'EXPIRED'
  | 'COMPLETED'
  | 'CANCELLED';

export type BranchInterviewListCandidate = InterviewTimelineRow & {
  id: string;
  applicationId: string;
};

const inProgressResults: InterviewResult[] = [
  InterviewResult.SELECTED_FOR_NEXT_ROUND,
  InterviewResult.ON_HOLD,
  InterviewResult.NEED_FURTHER_REVIEW,
  InterviewResult.PENDING,
];

const finalResults: InterviewResult[] = [
  InterviewResult.REJECTED,
  InterviewResult.PLACED,
];

export function classifyBranchInterviewListTab(
  interview: BranchInterviewListCandidate,
  tabContext: {
    now: Date;
    latestInterviewIds: Set<string>;
  },
): BranchInterviewListTab | null {
  const status = interview.status as InterviewStatus;
  const result = (interview.result ?? InterviewResult.PENDING) as InterviewResult;
  const lifecycle = resolveScheduledInterviewLifecycle({
    status,
    result,
    scheduledAt: interview.scheduledAt,
    durationMinutes: interview.durationMinutes,
    now: tabContext.now,
  });

  if (status === InterviewStatus.CANCELLED) {
    return 'CANCELLED';
  }

  if (status === InterviewStatus.NO_SHOW) {
    return 'COMPLETED';
  }

  if (
    tabContext.latestInterviewIds.has(interview.id) &&
    status === InterviewStatus.COMPLETED &&
    (finalResults.includes(result) || inProgressResults.includes(result))
  ) {
    if (finalResults.includes(result)) {
      return 'COMPLETED';
    }
    return 'IN_PROGRESS';
  }

  if (status === InterviewStatus.SCHEDULED) {
    if (lifecycle.phase === 'EXPIRED') {
      return 'EXPIRED';
    }
    if (lifecycle.phase === 'IN_PROGRESS') {
      return 'IN_PROGRESS';
    }
    if (lifecycle.phase === 'TODAY_UPCOMING') {
      return 'TODAY';
    }
    if (lifecycle.phase === 'UPCOMING') {
      return 'UPCOMING';
    }
  }

  return null;
}

export function classifyBranchInterviewListTabForApplicationRows(
  interviews: BranchInterviewListCandidate[],
  applicationStatus: string,
  applicationCreatedAt: Date,
  now: Date,
): BranchInterviewListTab | null {
  const workflow = resolveApplicationInterviewWorkflow({
    interviews,
    applicationStatus,
    applicationCreatedAt,
    now,
  });

  switch (workflow.phase) {
    case 'UPCOMING':
      return 'UPCOMING';
    case 'TODAY_UPCOMING':
      return 'TODAY';
    case 'IN_PROGRESS':
      return 'IN_PROGRESS';
    case 'EXPIRED':
      return 'EXPIRED';
    case 'NEXT_ROUND_PENDING':
    case 'ON_HOLD':
    case 'NEED_FURTHER_REVIEW':
    case 'COMPLETED_PENDING':
      return 'IN_PROGRESS';
    case 'PLACED':
    case 'REJECTED':
      return 'COMPLETED';
    case 'NOT_SCHEDULED':
    case 'WAITING_TO_SCHEDULE':
      return null;
    default:
      return null;
  }
}

export function isInterviewScheduledToday(
  scheduledAt: Date,
  now: Date,
): boolean {
  return isSameCalendarDay(scheduledAt, now);
}
