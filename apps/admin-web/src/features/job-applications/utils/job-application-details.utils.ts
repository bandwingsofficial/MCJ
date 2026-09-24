import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import type { JobApplicationBranchInterviewerAssignment } from "@/src/features/job-applications/types/job-application.types";
import {
  getBranchInterviewerAssignment,
  pickCurrentScheduledInterview,
  resolveApplicationInterviewDisplay,
  resolveInterviewPipelineDisplay,
} from "@/src/features/job-applications/types/job-application.types";
import {
  buildInterviewTimelineByRound,
  pickWorkflowActiveInterviewId,
} from "@/src/features/job-applications/utils/job-application-interview-timeline.utils";
import { isValidInterviewSchedule } from "@/src/features/job-applications/utils/interview-schedule.utils";

function compareInterviewRoundPriority(
  left: JobApplicationBranchInterviewerAssignment,
  right: JobApplicationBranchInterviewerAssignment,
): number {
  const sortLeft = left.round?.sortOrder ?? left.roundNumber ?? 0;
  const sortRight = right.round?.sortOrder ?? right.roundNumber ?? 0;
  if (sortRight !== sortLeft) {
    return sortRight - sortLeft;
  }
  const roundNumDelta = (right.roundNumber ?? 0) - (left.roundNumber ?? 0);
  if (roundNumDelta !== 0) {
    return roundNumDelta;
  }
  const leftTime = Date.parse(left.createdAt ?? "") || 0;
  const rightTime = Date.parse(right.createdAt ?? "") || 0;
  return rightTime - leftTime;
}

/** Current interview focus: same workflow pick as timeline (per-round canonical row). */
export function pickActiveInterviewForDetails(
  application: JobApplication,
): JobApplicationBranchInterviewerAssignment | null {
  const activeId = pickWorkflowActiveInterviewId(application);
  if (!activeId) {
    return null;
  }

  const fromList = (application.interviews ?? []).find(
    (item) => item.id === activeId,
  );
  if (fromList) {
    return fromList;
  }

  if (application.interviewAssignment?.id === activeId) {
    return application.interviewAssignment;
  }

  return pickCurrentScheduledInterview(application);
}

/** Cancelled / superseded schedules for the current round (same round key as active schedule). */
export function pickHistoricalSchedulesForDetails(
  application: JobApplication,
  currentScheduled: JobApplicationBranchInterviewerAssignment | null,
): JobApplicationBranchInterviewerAssignment[] {
  const entries = buildInterviewTimelineByRound(application.interviews ?? []);

  if (currentScheduled) {
    const entry = entries.find(
      (item) =>
        item.primary.id === currentScheduled.id ||
        item.historical.some((row) => row.id === currentScheduled.id),
    );
    if (!entry) {
      return [];
    }
    return [...entry.historical].sort(
      (left, right) =>
        (Date.parse(left.createdAt ?? "") || 0) -
        (Date.parse(right.createdAt ?? "") || 0),
    );
  }

  const cancelledHistory: JobApplicationBranchInterviewerAssignment[] = [];
  for (const entry of entries) {
    if (
      entry.primary.status === "CANCELLED" &&
      isValidInterviewSchedule(entry.primary.scheduledAt)
    ) {
      cancelledHistory.push(entry.primary);
    }
    for (const row of entry.historical) {
      if (
        row.status === "CANCELLED" &&
        isValidInterviewSchedule(row.scheduledAt)
      ) {
        cancelledHistory.push(row);
      }
    }
  }

  return cancelledHistory.sort(
    (left, right) =>
      (Date.parse(left.createdAt ?? "") || 0) -
      (Date.parse(right.createdAt ?? "") || 0),
  );
}

export function pickPreviousRoundInterview(
  application: JobApplication,
  active: JobApplicationBranchInterviewerAssignment | null,
): JobApplicationBranchInterviewerAssignment | null {
  if (!active) {
    return null;
  }

  const activeOrder = active.round?.sortOrder ?? active.roundNumber ?? 0;
  const previous = buildInterviewTimelineByRound(application.interviews ?? [])
    .map((entry) => entry.primary)
    .filter(
      (item) =>
        item.id !== active.id &&
        item.status === "COMPLETED" &&
        (item.round?.sortOrder ?? item.roundNumber ?? 0) < activeOrder,
    )
    .sort(compareInterviewRoundPriority);

  return previous[0] ?? null;
}

export function resolveApplicationWorkflowStateLabel(
  application: JobApplication,
): string {
  if (application.status === "PLACED") {
    return "Placed";
  }
  if (application.status === "REJECTED") {
    return "Rejected";
  }

  const scheduled = pickCurrentScheduledInterview(application);
  if (scheduled?.scheduledAt && scheduled.status === "SCHEDULED") {
    const scheduledMs = Date.parse(scheduled.scheduledAt);
    if (Number.isFinite(scheduledMs) && scheduledMs < Date.now()) {
      return "Expired";
    }
  }

  const pipeline = application.interviewAssignment
    ? resolveInterviewPipelineDisplay(application.interviewAssignment)
    : resolveApplicationInterviewDisplay(application);

  if (pipeline.key === "SCHEDULED") {
    return "Scheduled";
  }
  if (pipeline.key === "SELECTED_FOR_NEXT_ROUND") {
    return "Selected for Next Round";
  }
  if (pipeline.key === "COMPLETED") {
    return "In Progress";
  }
  if (pipeline.key === "NOT_YET") {
    if (getBranchInterviewerAssignment(application)) {
      return "Not Scheduled";
    }
    if (
      application.status === "APPLIED" ||
      application.status === "UNDER_REVIEW"
    ) {
      return "Pending";
    }
    if (application.status === "SHORTLISTED") {
      return "Not Scheduled";
    }
  }

  return pipeline.label
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatDetailDateTime(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const time = Date.parse(value);
  if (!Number.isFinite(time) || time <= Date.parse("1970-01-02T00:00:00.000Z")) {
    return null;
  }
  return new Date(time).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDetailDate(value?: string | null): string | null {
  if (!value) {
    return null;
  }
  const time = Date.parse(value);
  if (!Number.isFinite(time)) {
    return null;
  }
  return new Date(time).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function formatRoundHeading(
  interview: JobApplicationBranchInterviewerAssignment,
): string {
  const order = interview.round?.sortOrder ?? interview.roundNumber;
  const name = interview.round?.name?.trim() || "Interview Round";
  return order != null ? `${order}. ${name}` : name;
}

export function hasPersistedSchedule(
  interview?: JobApplicationBranchInterviewerAssignment | null,
): boolean {
  return Boolean(interview && isValidInterviewSchedule(interview.scheduledAt));
}
