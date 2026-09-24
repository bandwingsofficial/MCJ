import { JobApplicationStatus } from '@prisma/client';
import {
  buildBranchInterviewWorkflowAlerts,
  resolveApplicationInterviewWorkflow,
  type BranchInterviewWorkflowAlert,
  type BranchInterviewWorkflowMetrics,
} from '@mcj/shared-constants';

import type { BranchJobApplicationInterviewListRow } from './branch-job-application-interview-list.util';

export function computeBranchJobApplicationWorkflowMetrics(
  candidates: Array<{
    status: JobApplicationStatus;
    createdAt: Date;
    interviews: BranchJobApplicationInterviewListRow[];
  }>,
  now = new Date(),
): {
  metrics: BranchInterviewWorkflowMetrics;
  alerts: BranchInterviewWorkflowAlert[];
} {
  const metrics: BranchInterviewWorkflowMetrics = {
    notScheduled: 0,
    waitingToSchedule: 0,
    scheduledUpcoming: 0,
    today: 0,
    inProgress: 0,
    expired: 0,
    nextRoundPending: 0,
    completedPending: 0,
    placed: 0,
    rejected: 0,
    onHold: 0,
    needFurtherReview: 0,
  };

  for (const candidate of candidates) {
    const workflow = resolveApplicationInterviewWorkflow({
      interviews: candidate.interviews,
      applicationStatus: candidate.status,
      applicationCreatedAt: candidate.createdAt,
      now,
    });

    switch (workflow.phase) {
      case 'NOT_YET_STARTED':
      case 'NOT_SCHEDULED':
        metrics.notScheduled += 1;
        break;
      case 'RESCHEDULE_REQUIRED':
        metrics.waitingToSchedule += 1;
        break;
      case 'WAITING_TO_SCHEDULE':
        metrics.waitingToSchedule += 1;
        break;
      case 'UPCOMING':
        metrics.scheduledUpcoming += 1;
        break;
      case 'TODAY_UPCOMING':
        metrics.today += 1;
        break;
      case 'IN_PROGRESS':
        metrics.inProgress += 1;
        break;
      case 'EXPIRED':
        metrics.expired += 1;
        break;
      case 'NEXT_ROUND_PENDING':
        metrics.nextRoundPending += 1;
        break;
      case 'COMPLETED_PENDING':
        metrics.completedPending += 1;
        break;
      case 'PLACED':
        metrics.placed += 1;
        break;
      case 'REJECTED':
        metrics.rejected += 1;
        break;
      case 'ON_HOLD':
        metrics.onHold += 1;
        break;
      case 'NEED_FURTHER_REVIEW':
        metrics.needFurtherReview += 1;
        break;
      default:
        break;
    }
  }

  return {
    metrics,
    alerts: buildBranchInterviewWorkflowAlerts(metrics),
  };
}
