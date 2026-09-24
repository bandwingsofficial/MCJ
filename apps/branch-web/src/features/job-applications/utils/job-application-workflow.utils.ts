import {
  isPersistedScheduledInterviewRow,
  resolveApplicationInterviewWorkflow,
} from "@mcj/shared-constants";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";

export {
  getBranchJobApplicationInterviews,
  isJobApplicationScheduleBlocked,
  resolveJobApplicationListPresentation,
  type JobApplicationListPresentation,
} from "@/src/features/branch-interview-lifecycle/presentation";

export type JobApplicationScheduleTabBucket =
  | "NOT_SCHEDULED"
  | "SCHEDULED"
  | "FINAL";

export function resolveJobApplicationScheduleTab(
  application: JobApplicationItem,
  nowMs = Date.now(),
): JobApplicationScheduleTabBucket {
  if (
    application.listScheduleTab === "NOT_SCHEDULED" ||
    application.listScheduleTab === "SCHEDULED" ||
    application.listScheduleTab === "FINAL"
  ) {
    return application.listScheduleTab;
  }

  const interviews =
    application.branchInterviews?.length
      ? application.branchInterviews
      : application.latestInterview
        ? [application.latestInterview]
        : [];

  const workflow = resolveApplicationInterviewWorkflow({
    interviews,
    applicationStatus: application.status,
    applicationCreatedAt: application.createdAt,
    now: new Date(nowMs),
  });

  if (workflow.phase === "PLACED" || workflow.phase === "REJECTED") {
    return "FINAL";
  }

  if (
    workflow.phase === "UPCOMING" ||
    workflow.phase === "TODAY_UPCOMING" ||
    workflow.phase === "IN_PROGRESS" ||
    workflow.phase === "EXPIRED"
  ) {
    return "SCHEDULED";
  }

  if (
    workflow.phase === "NOT_YET_STARTED" ||
    workflow.phase === "NOT_SCHEDULED" ||
    workflow.phase === "WAITING_TO_SCHEDULE" ||
    workflow.phase === "RESCHEDULE_REQUIRED" ||
    workflow.phase === "NEXT_ROUND_PENDING"
  ) {
    return "NOT_SCHEDULED";
  }

  if (
    interviews.some((item) =>
      isPersistedScheduledInterviewRow(
        {
          id: item.id,
          status: item.status,
          result: item.result,
          scheduledAt: item.scheduledAt,
          durationMinutes: item.durationMinutes,
          createdAt: item.createdAt,
          roundNumber: item.roundNumber,
        },
        new Date(nowMs),
      ),
    )
  ) {
    return "SCHEDULED";
  }

  const appStatus = (application.status ?? "").toUpperCase();
  if (appStatus === "PLACED" || appStatus === "REJECTED") {
    return "FINAL";
  }

  return "NOT_SCHEDULED";
}
