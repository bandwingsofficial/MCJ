"use client";

import type { ReactNode } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";

import type {
  JobApplication,
  JobApplicationInterviewAssignment,
} from "@/src/features/student-jobs/types";
import {
  formatBranchAddress,
  formatInterviewDate,
  formatInterviewMode,
  formatInterviewTime,
  formatInterviewerName,
  isOfflineInterviewMode,
  isOnlineInterviewMode,
  isValidInterviewSchedule,
} from "@/src/features/student-jobs/utils/interview-schedule.utils";
import {
  buildInterviewTimelineByRound,
  historicalInterviewStepLabel,
} from "@/src/features/student-jobs/utils/job-application-interview.utils";
import {
  isShortlistedStatus,
  resolveCustomerApplicationStatus,
} from "@/src/features/student-jobs/utils/job-application-status.utils";

interface ApplicationTimelineProps {
  application: JobApplication;
}

type TimelineMarker = "done" | "current" | "pending";

function formatTimelineDate(value?: string | Date | null): string {
  if (!value) return "—";
  const time =
    value instanceof Date ? value.getTime() : Date.parse(String(value));
  if (!Number.isFinite(time) || time <= Date.parse("1970-01-02T00:00:00.000Z")) {
    return "—";
  }
  return new Date(time).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatInterviewResult(result?: string | null): string | null {
  if (!result || result === "PENDING") return null;
  if (result === "SELECTED_FOR_NEXT_ROUND") return "Selected for Next Round";
  if (result === "REJECTED") return "Rejected";
  if (result === "ON_HOLD") return "On Hold";
  if (result === "NEED_FURTHER_REVIEW") return "Need Further Review";
  if (result === "PLACED") return "Placed";
  return result
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/^\w/, (char) => char.toUpperCase());
}

function roundTitle(interview: JobApplicationInterviewAssignment): string {
  const name = interview.round?.name?.trim();
  if (name) {
    return name;
  }
  return "Interview Round";
}

function interviewPhase(
  interview: JobApplicationInterviewAssignment,
): TimelineMarker {
  if (interview.status === "COMPLETED" || interview.status === "NO_SHOW") {
    return "done";
  }
  if (interview.status === "SCHEDULED" || interview.status === "ASSIGNED") {
    return "current";
  }
  if (interview.status === "CANCELLED") {
    return "done";
  }
  return "pending";
}

function Marker({ state }: { state: TimelineMarker }) {
  if (state === "done") {
    return (
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white"
      >
        ✓
      </span>
    );
  }

  if (state === "current") {
    return (
      <span
        aria-hidden
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-semibold text-white"
      >
        ●
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-[10px] font-semibold text-slate-400"
    >
      ○
    </span>
  );
}

function TimelineStep({
  state,
  title,
  subtitle,
  children,
  isLast,
}: {
  state: TimelineMarker;
  title: string;
  subtitle?: string | null;
  children?: ReactNode;
  isLast?: boolean;
}) {
  return (
    <div className="relative flex gap-3">
      <div className="flex flex-col items-center">
        <Marker state={state} />
        {!isLast ? (
          <div className="mt-1 w-px flex-1 bg-slate-200" aria-hidden />
        ) : null}
      </div>
      <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-6"}`}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p
            className={`text-sm font-semibold ${
              state === "current" ? "text-sky-900" : "text-slate-900"
            }`}
          >
            {title}
          </p>
          {subtitle ? (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function InterviewRoundDetails({
  interview,
  state,
}: {
  interview: JobApplicationInterviewAssignment;
  state: TimelineMarker;
}) {
  const resultLabel = formatInterviewResult(interview.result);
  const interviewerName = formatInterviewerName(interview.interviewer);
  const isOnline = isOnlineInterviewMode(interview.mode);
  const isOffline = isOfflineInterviewMode(interview.mode);
  const meetingLink =
    isOnline && interview.locationOrLink?.trim()
      ? interview.locationOrLink.trim()
      : null;
  const branchName = interview.branch?.branchName ?? null;
  const branchAddress = formatBranchAddress(interview.branch);
  const venue =
    isOffline && interview.locationOrLink?.trim()
      ? interview.locationOrLink.trim()
      : null;
  const showSchedule =
    (interview.status === "SCHEDULED" &&
      isValidInterviewSchedule(interview.scheduledAt)) ||
    (interview.status === "COMPLETED" &&
      isValidInterviewSchedule(interview.scheduledAt)) ||
    (interview.status === "CANCELLED" &&
      isValidInterviewSchedule(interview.scheduledAt));

  return (
    <div
      className={`mt-2 space-y-2 rounded-lg border px-3 py-3 text-sm ${
        state === "current"
          ? "border-sky-200 bg-sky-50/80"
          : "border-slate-100 bg-slate-50/80"
      }`}
    >
      {showSchedule ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Interview Date</p>
            <p className="font-medium">
              {formatInterviewDate(interview.scheduledAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Time</p>
            <p className="font-medium">
              {formatInterviewTime(interview.scheduledAt)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Mode</p>
            <p className="font-medium">{formatInterviewMode(interview.mode)}</p>
          </div>
          {interviewerName ? (
            <div>
              <p className="text-xs text-muted-foreground">Interviewer</p>
              <p className="font-medium">{interviewerName}</p>
            </div>
          ) : null}
        </div>
      ) : interview.status === "ASSIGNED" ? (
        <p className="text-muted-foreground">
          Assigned — schedule details will appear once the interview is booked.
        </p>
      ) : null}

      {isOnline && meetingLink && state === "current" ? (
        <div>
          <p className="text-xs text-muted-foreground">Meeting Link</p>
          <div className="mt-1">
            <Button
              size="sm"
              onClick={() => {
                window.open(meetingLink, "_blank", "noopener,noreferrer");
              }}
            >
              Join Interview
            </Button>
          </div>
        </div>
      ) : null}

      {isOffline ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {branchName ? (
            <div>
              <p className="text-xs text-muted-foreground">Branch</p>
              <p className="font-medium">{branchName}</p>
            </div>
          ) : null}
          {venue ? (
            <div>
              <p className="text-xs text-muted-foreground">Venue</p>
              <p className="font-medium">{venue}</p>
            </div>
          ) : null}
          {branchAddress ? (
            <div className="sm:col-span-2">
              <p className="text-xs text-muted-foreground">Address</p>
              <p className="font-medium">{branchAddress}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {resultLabel ? (
        <div>
          <p className="text-xs text-muted-foreground">Result</p>
          <p className="font-medium">{resultLabel}</p>
        </div>
      ) : null}

      {interview.evaluation?.trim() && state === "done" ? (
        <div>
          <p className="text-xs text-muted-foreground">Feedback</p>
          <p className="font-medium whitespace-pre-wrap">
            {interview.evaluation.trim()}
          </p>
        </div>
      ) : null}
    </div>
  );
}

function interviewTimelineSubtitle(
  interview: JobApplicationInterviewAssignment,
  state: TimelineMarker,
  historical: boolean,
): string {
  if (historical) {
    return historicalInterviewStepLabel(interview);
  }
  if (state === "done") {
    if (interview.status === "CANCELLED") {
      return "Cancelled";
    }
    if (interview.status === "NO_SHOW") {
      return "No Show";
    }
    return "Completed";
  }
  if (state === "current") {
    return interview.status === "ASSIGNED" ? "Assigned" : "Scheduled";
  }
  return "Not Started";
}

export function ApplicationTimeline({
  application,
}: ApplicationTimelineProps) {
  const roundEntries = buildInterviewTimelineByRound(
    application.interviews ?? [],
  );

  const statusKey = resolveCustomerApplicationStatus(
    application.status,
    application.interviewStatus,
  );
  const shortlisted = isShortlistedStatus(
    application.status,
    application.interviewStatus,
  );
  const shortlistedAt =
    shortlisted || statusKey === "SELECTED" || statusKey === "PLACED"
      ? application.updatedAt
      : null;

  const steps: Array<{
    key: string;
    state: TimelineMarker;
    title: string;
    subtitle?: string | null;
    body?: ReactNode;
  }> = [
    {
      key: "applied",
      state: "done",
      title: "Applied",
      subtitle: formatTimelineDate(application.createdAt),
    },
  ];

  if (shortlisted || statusKey === "SELECTED" || statusKey === "PLACED") {
    steps.push({
      key: "shortlisted",
      state: "done",
      title: "Shortlisted",
      subtitle: formatTimelineDate(shortlistedAt),
    });
  }

  for (const entry of roundEntries) {
    const historicalSorted = [...entry.historical].sort((a, b) => {
      const aTime = Date.parse(a.createdAt ?? "") || 0;
      const bTime = Date.parse(b.createdAt ?? "") || 0;
      return aTime - bTime;
    });

    const pushInterviewStep = (
      interview: JobApplicationInterviewAssignment,
      isHistoricalRow: boolean,
    ) => {
      if (
        interview.status === "CANCELLED" &&
        !isValidInterviewSchedule(interview.scheduledAt) &&
        isHistoricalRow
      ) {
        return;
      }

      const state = interviewPhase(interview);

      steps.push({
        key: interview.id,
        state,
        title: roundTitle(interview),
        subtitle: interviewTimelineSubtitle(
          interview,
          state,
          isHistoricalRow,
        ),
        body: <InterviewRoundDetails interview={interview} state={state} />,
      });
    };

    for (const interview of historicalSorted) {
      pushInterviewStep(interview, true);
    }
    pushInterviewStep(entry.primary, false);
  }

  if (statusKey === "PLACED") {
    steps.push({
      key: "final-placed",
      state: "done",
      title: "Final Status",
      subtitle: "PLACED",
    });
  } else if (statusKey === "SELECTED") {
    steps.push({
      key: "final-selected",
      state: "done",
      title: "Final Status",
      subtitle: "SELECTED",
    });
  } else if (statusKey === "REJECTED") {
    steps.push({
      key: "final-rejected",
      state: "done",
      title: "Final Status",
      subtitle: "REJECTED",
    });
  }

  return (
    <Card className="space-y-4 p-6">
      <div>
        <h2 className="text-lg font-semibold">Application Progress</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Your interview journey for this application.
        </p>
      </div>

      <div className="space-y-0">
        {steps.map((step, index) => (
          <TimelineStep
            key={step.key}
            state={step.state}
            title={step.title}
            subtitle={step.subtitle}
            isLast={index === steps.length - 1}
          >
            {step.body}
          </TimelineStep>
        ))}
      </div>
    </Card>
  );
}
