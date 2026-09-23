"use client";

import type { ReactNode } from "react";

import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  formatBranchAddress,
  formatInterviewDateLabel,
  formatInterviewModeLabel,
  formatInterviewResultLabel,
  formatInterviewTimeLabel,
  formatInterviewerName,
  hasScheduledInterview,
  isOfflineInterviewMode,
  isOnlineInterviewMode,
  isValidInterviewSchedule,
} from "@/src/features/job-applications/utils/interview-schedule.utils";

type TimelineMarker = "done" | "current" | "pending";

function formatTimelineDate(value?: string | null): string | null {
  if (!value) return null;
  const time = Date.parse(value);
  if (!Number.isFinite(time) || time <= Date.parse("1970-01-02T00:00:00.000Z")) {
    return null;
  }
  return new Date(time).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function roundTitle(
  interview: NonNullable<JobApplication["interviews"]>[number],
): string {
  const name = interview.round?.name?.trim();
  return name || "Interview Round";
}

function interviewPhase(
  interview: NonNullable<JobApplication["interviews"]>[number],
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

function phaseSubtitle(
  interview: NonNullable<JobApplication["interviews"]>[number],
  state: TimelineMarker,
): string | null {
  if (state === "done") {
    if (interview.status === "CANCELLED") return "Cancelled";
    if (interview.status === "NO_SHOW") return "No Show";
    if (interview.status === "COMPLETED") return "Completed";
  }
  if (state === "current") {
    if (interview.status === "ASSIGNED") return "Assigned";
    if (interview.status === "SCHEDULED") return "Scheduled";
  }
  return null;
}

function Marker({ state }: { state: TimelineMarker }) {
  if (state === "done") {
    return (
      <span
        aria-hidden
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white"
      >
        ✓
      </span>
    );
  }

  if (state === "current") {
    return (
      <span
        aria-hidden
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-600 text-[10px] font-semibold text-white"
      >
        ●
      </span>
    );
  }

  return (
    <span
      aria-hidden
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-[10px] text-slate-400"
    >
      ○
    </span>
  );
}

function DetailLine({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm text-[#102A56]">
      <span className="text-[#647A9B]">{label}: </span>
      {value}
    </p>
  );
}

function InterviewRoundBody({
  interview,
  state,
}: {
  interview: NonNullable<JobApplication["interviews"]>[number];
  state: TimelineMarker;
}) {
  const resultLabel = formatInterviewResultLabel(interview.result);
  const interviewerName = formatInterviewerName(interview.interviewer);
  const modeLabel = formatInterviewModeLabel(interview.mode);
  const dateLabel = formatInterviewDateLabel(interview.scheduledAt);
  const timeLabel = formatInterviewTimeLabel(interview.scheduledAt);
  const isOnline = isOnlineInterviewMode(interview.mode);
  const isOffline = isOfflineInterviewMode(interview.mode);
  const meetingLink =
    isOnline && interview.locationOrLink?.trim()
      ? interview.locationOrLink.trim()
      : null;
  const branchName = interview.branch?.branchName?.trim() || null;
  const branchAddress = formatBranchAddress(interview.branch);
  const venue =
    isOffline && interview.locationOrLink?.trim()
      ? interview.locationOrLink.trim()
      : null;
  const remarks = interview.notes?.trim() || null;
  const feedback = interview.evaluation?.trim() || null;

  const showSchedule =
    hasScheduledInterview(interview) ||
    (interview.status === "COMPLETED" &&
      isValidInterviewSchedule(interview.scheduledAt));

  const lines: ReactNode[] = [];

  if (showSchedule) {
    if (dateLabel) lines.push(<DetailLine key="date" label="Date" value={dateLabel} />);
    if (timeLabel) lines.push(<DetailLine key="time" label="Time" value={timeLabel} />);
    if (modeLabel) lines.push(<DetailLine key="mode" label="Mode" value={modeLabel} />);
  }

  if (interviewerName) {
    lines.push(
      <DetailLine key="interviewer" label="Interviewer" value={interviewerName} />,
    );
  }

  if (isOnline && meetingLink) {
    lines.push(
      <p key="link" className="text-sm text-[#102A56]">
        <span className="text-[#647A9B]">Meeting Link: </span>
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-[#2563EB] underline-offset-2 hover:underline"
        >
          {meetingLink}
        </a>
      </p>,
    );
  }

  if (isOffline) {
    if (branchName) {
      lines.push(<DetailLine key="branch" label="Branch" value={branchName} />);
    }
    if (venue) {
      lines.push(<DetailLine key="venue" label="Venue" value={venue} />);
    }
    if (branchAddress) {
      lines.push(<DetailLine key="address" label="Address" value={branchAddress} />);
    }
  } else if (!isOnline && branchName) {
    lines.push(<DetailLine key="branch" label="Branch" value={branchName} />);
  }

  if (resultLabel) {
    lines.push(<DetailLine key="result" label="Result" value={resultLabel} />);
  }

  if (feedback && interview.status === "COMPLETED") {
    lines.push(
      <div key="feedback" className="text-sm text-[#102A56]">
        <p className="text-[#647A9B]">Feedback</p>
        <p className="mt-0.5 whitespace-pre-wrap">{feedback}</p>
      </div>,
    );
  }

  if (remarks) {
    lines.push(
      <div key="remarks" className="text-sm text-[#102A56]">
        <p className="text-[#647A9B]">Remarks</p>
        <p className="mt-0.5 whitespace-pre-wrap">{remarks}</p>
      </div>,
    );
  }

  if (lines.length === 0) {
    return null;
  }

  return (
    <div
      className={`mt-2 space-y-1.5 rounded-lg border px-3 py-2.5 ${
        state === "current"
          ? "border-sky-200 bg-sky-50/60"
          : "border-slate-100 bg-slate-50/80"
      }`}
    >
      {lines}
    </div>
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
          <div className="mt-1 w-px min-h-[1rem] flex-1 bg-slate-200" aria-hidden />
        ) : null}
      </div>
      <div className={`min-w-0 flex-1 ${isLast ? "pb-0" : "pb-5"}`}>
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p
            className={`text-sm font-semibold ${
              state === "current" ? "text-sky-900" : "text-[#102A56]"
            }`}
          >
            {title}
          </p>
          {subtitle ? (
            <p className="text-xs text-[#647A9B]">{subtitle}</p>
          ) : null}
        </div>
        {children}
      </div>
    </div>
  );
}

function isShortlistedPipeline(status: JobApplication["status"]): boolean {
  return (
    status === "SHORTLISTED" ||
    status === "INTERVIEW" ||
    status === "ASSESSMENT" ||
    status === "SELECTED" ||
    status === "PLACED"
  );
}

interface Props {
  application: JobApplication;
}

export function JobApplicationInterviewTimeline({ application }: Props) {
  const interviews = [...(application.interviews ?? [])].sort((a, b) => {
    const roundDiff = (a.roundNumber ?? 0) - (b.roundNumber ?? 0);
    if (roundDiff !== 0) return roundDiff;
    const sortA = a.round?.sortOrder ?? 0;
    const sortB = b.round?.sortOrder ?? 0;
    if (sortA !== sortB) return sortA - sortB;
    const aTime = a.scheduledAt
      ? Date.parse(a.scheduledAt)
      : a.createdAt
        ? Date.parse(a.createdAt)
        : 0;
    const bTime = b.scheduledAt
      ? Date.parse(b.scheduledAt)
      : b.createdAt
        ? Date.parse(b.createdAt)
        : 0;
    return aTime - bTime;
  });

  const appliedSubtitle = formatTimelineDate(application.createdAt);

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
      subtitle: appliedSubtitle,
    },
  ];

  if (isShortlistedPipeline(application.status)) {
    steps.push({
      key: "shortlisted",
      state: "done",
      title: "Shortlisted",
      subtitle: formatTimelineDate(application.updatedAt),
    });
  }

  for (const interview of interviews) {
    if (
      interview.status === "CANCELLED" &&
      !isValidInterviewSchedule(interview.scheduledAt)
    ) {
      continue;
    }

    const state = interviewPhase(interview);
    const body = <InterviewRoundBody interview={interview} state={state} />;

    steps.push({
      key: interview.id,
      state,
      title: roundTitle(interview),
      subtitle: phaseSubtitle(interview, state),
      body,
    });
  }

  if (application.status === "PLACED") {
    steps.push({
      key: "final-placed",
      state: "done",
      title: "Final Result",
      subtitle: "Placed",
    });
  } else if (application.status === "REJECTED") {
    const reason = application.rejectionReason?.trim();
    steps.push({
      key: "final-rejected",
      state: "done",
      title: "Final Result",
      subtitle: "Rejected",
      body: reason ? (
        <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5">
          <DetailLine label="Reason" value={reason} />
        </div>
      ) : null,
    });
  }

  return (
    <div className="space-y-3">
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
  );
}
