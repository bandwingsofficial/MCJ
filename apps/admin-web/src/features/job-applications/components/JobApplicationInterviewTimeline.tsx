"use client";

import type { ReactNode } from "react";

import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  buildInterviewTimelineByRound,
  pickWorkflowActiveInterviewId,
} from "@/src/features/job-applications/utils/job-application-interview-timeline.utils";
import {
  formatBranchAddress,
  formatInterviewDateTimeLabel,
  formatInterviewLifecycleStatusLabel,
  formatInterviewModeLabel,
  formatInterviewResultLabel,
  formatInterviewerName,
  isOfflineInterviewMode,
  isOnlineInterviewMode,
  isValidInterviewSchedule,
  canShowJoinInterviewLink,
} from "@/src/features/job-applications/utils/interview-schedule.utils";

type TimelineMarker = "done" | "current" | "pending";
type InterviewRow = NonNullable<JobApplication["interviews"]>[number];

function roundStepTitle(interview: InterviewRow, displayOrder: number): string {
  const order =
    interview.round?.sortOrder ?? interview.roundNumber ?? displayOrder;
  const name = interview.round?.name?.trim() || "Interview Round";
  return `${order}. ${name}`;
}

function interviewPhase(
  interview: InterviewRow,
  currentActiveId: string | null,
): TimelineMarker {
  if (currentActiveId && interview.id === currentActiveId) {
    return "current";
  }
  if (interview.status === "COMPLETED" || interview.status === "NO_SHOW") {
    return "done";
  }
  if (interview.status === "CANCELLED") {
    return "done";
  }
  if (interview.status === "SCHEDULED" || interview.status === "ASSIGNED") {
    return "pending";
  }
  return "pending";
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
  historical,
  workflowActive,
}: {
  interview: InterviewRow;
  state: TimelineMarker;
  historical?: boolean;
  workflowActive?: boolean;
}) {
  const resultLabel = formatInterviewResultLabel(interview.result);
  const interviewerName = formatInterviewerName(interview.interviewer);
  const modeLabel = formatInterviewModeLabel(interview.mode);
  const scheduledLabel = formatInterviewDateTimeLabel(interview.scheduledAt);
  const statusLabel = formatInterviewLifecycleStatusLabel(interview.status);
  const clearedAt =
    interview.status === "COMPLETED" && interview.updatedAt
      ? formatInterviewDateTimeLabel(interview.updatedAt)
      : null;
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
  const nextRoundName = interview.nextRound?.name?.trim() || null;

  const showSchedule = isValidInterviewSchedule(interview.scheduledAt);

  const lines: ReactNode[] = [];

  if (showSchedule && scheduledLabel) {
    lines.push(
      <DetailLine key="scheduled" label="Scheduled At" value={scheduledLabel} />,
    );
  }

  if (interviewerName) {
    lines.push(
      <DetailLine key="interviewer" label="Interviewer" value={interviewerName} />,
    );
  }

  if (modeLabel) {
    lines.push(<DetailLine key="mode" label="Mode" value={modeLabel} />);
  }

  if (
    statusLabel &&
    interview.status !== "COMPLETED" &&
    interview.status !== "NO_SHOW"
  ) {
    lines.push(<DetailLine key="status" label="Status" value={statusLabel} />);
  }

  if (
    meetingLink &&
    canShowJoinInterviewLink(interview, {
      historical,
      workflowActive,
    })
  ) {
    lines.push(
      <p key="link" className="text-sm text-[#102A56]">
        <a
          href={meetingLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center justify-center rounded-md bg-[#2563EB] px-3 text-sm font-medium text-white shadow-[0_4px_14px_rgba(37,99,235,0.2)] hover:bg-[#1D4ED8]"
        >
          Join Interview
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

  if (
    nextRoundName &&
    interview.result === "SELECTED_FOR_NEXT_ROUND"
  ) {
    lines.push(
      <DetailLine key="next-round" label="Next Round" value={nextRoundName} />,
    );
  }

  if (clearedAt) {
    lines.push(
      <DetailLine
        key="cleared"
        label={
          interview.result === "REJECTED" ? "Rejected At" : "Result Recorded At"
        }
        value={clearedAt}
      />,
    );
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
        historical
          ? "border-slate-200 bg-slate-100/70"
          : state === "current"
            ? "border-sky-200 bg-sky-50/60"
            : "border-slate-100 bg-slate-50/80"
      }`}
    >
      {historical ? (
        <p className="text-xs font-medium uppercase tracking-wide text-[#647A9B]">
          Previous schedule
        </p>
      ) : null}
      {lines}
    </div>
  );
}

function TimelineStep({
  state,
  title,
  children,
  isLast,
}: {
  state: TimelineMarker;
  title: string;
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
        <p
          className={`text-sm font-semibold ${
            state === "current" ? "text-sky-900" : "text-[#102A56]"
          }`}
        >
          {title}
        </p>
        {children}
      </div>
    </div>
  );
}

interface Props {
  application: JobApplication;
}

export function JobApplicationInterviewTimeline({ application }: Props) {
  const roundEntries = buildInterviewTimelineByRound(
    application.interviews ?? [],
  );
  const currentActiveId = pickWorkflowActiveInterviewId(application);

  const steps: Array<{
    key: string;
    state: TimelineMarker;
    title: string;
    body?: ReactNode;
  }> = [];

  roundEntries.forEach((entry, index) => {
    const interview = entry.primary;
    const state = interviewPhase(interview, currentActiveId);
    steps.push({
      key: entry.roundKey,
      state,
      title: roundStepTitle(interview, index + 1),
      body: (
        <div className="space-y-2">
          <InterviewRoundBody
            interview={interview}
            state={state}
            workflowActive={interview.id === currentActiveId}
          />
          {[...entry.historical]
            .sort(
              (left, right) =>
                (Date.parse(left.createdAt ?? "") || 0) -
                (Date.parse(right.createdAt ?? "") || 0),
            )
            .map((historicalInterview) => (
              <InterviewRoundBody
                key={historicalInterview.id}
                interview={historicalInterview}
                state="done"
                historical
                workflowActive={false}
              />
            ))}
        </div>
      ),
    });
  });

  const canonicalInterviews = roundEntries.map((entry) => entry.primary);
  const hasPlacedResult = canonicalInterviews.some(
    (item) => item.status === "COMPLETED" && item.result === "PLACED",
  );
  const hasRejectedResult = canonicalInterviews.some(
    (item) => item.status === "COMPLETED" && item.result === "REJECTED",
  );

  if (application.status === "PLACED" || hasPlacedResult) {
    steps.push({
      key: "final-placed",
      state: "done",
      title: "Final Outcome",
      body: (
        <div className="mt-2 rounded-lg border border-emerald-100 bg-emerald-50/60 px-3 py-2.5">
          <DetailLine label="Result" value="Placed" />
        </div>
      ),
    });
  } else if (application.status === "REJECTED" || hasRejectedResult) {
    const reason = application.rejectionReason?.trim();
    steps.push({
      key: "final-rejected",
      state: "done",
      title: "Final Outcome",
      body: (
        <div className="mt-2 rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5">
          <DetailLine label="Result" value="Rejected" />
          {reason ? <DetailLine label="Reason" value={reason} /> : null}
        </div>
      ),
    });
  }

  if (steps.length === 0) {
    return (
      <p className="text-sm text-[#647A9B]">
        No interview rounds recorded yet for this application.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <TimelineStep
          key={step.key}
          state={step.state}
          title={step.title}
          isLast={index === steps.length - 1}
        >
          {step.body}
        </TimelineStep>
      ))}
    </div>
  );
}
