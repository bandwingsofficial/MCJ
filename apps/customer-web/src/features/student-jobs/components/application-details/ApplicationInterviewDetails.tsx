"use client";

import { Card } from "@/src/shared/components/ui/card";
import { Button } from "@/src/shared/components/ui/button";
import { ApplicationInterviewStatusBadge } from "@/src/features/student-jobs/components/application-list/ApplicationInterviewStatusBadge";
import {
  formatBranchAddress,
  formatInterviewDate,
  formatInterviewMode,
  formatInterviewTime,
  formatInterviewerName,
  getInterviewRelativeLabel,
  hasScheduledInterview,
  isOfflineInterviewMode,
  isOnlineInterviewMode,
} from "@/src/features/student-jobs/utils/interview-schedule.utils";

import type { JobApplication } from "@/src/features/student-jobs/types";

interface ApplicationInterviewDetailsProps {
  application: JobApplication;
  /** Compact layout for list cards; full card for details page. */
  compact?: boolean;
}

export function ApplicationInterviewDetails({
  application,
  compact = false,
}: ApplicationInterviewDetailsProps) {
  const assignment = application.interviewAssignment;

  if (!hasScheduledInterview(assignment)) {
    return null;
  }

  const branchName = assignment.branch?.branchName ?? null;
  const branchAddress = formatBranchAddress(assignment.branch);
  const interviewerName = formatInterviewerName(assignment.interviewer);
  const relativeLabel = getInterviewRelativeLabel(
    assignment.scheduledAt,
    assignment.status,
  );
  const modeLabel = formatInterviewMode(assignment.mode);
  const isOnline = isOnlineInterviewMode(assignment.mode);
  const isOffline = isOfflineInterviewMode(assignment.mode);
  const meetingLink =
    isOnline && assignment.locationOrLink?.trim()
      ? assignment.locationOrLink.trim()
      : null;
  const venue =
    isOffline && assignment.locationOrLink?.trim()
      ? assignment.locationOrLink.trim()
      : branchName
        ? `${branchName} Branch`
        : null;

  const content = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className={compact ? "text-base font-semibold" : "text-lg font-semibold"}>
          Interview Scheduled
        </h3>
        <span className="rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-medium text-sky-800">
          {relativeLabel}
        </span>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        <div>
          <p className="text-muted-foreground">Interview Status</p>
          <div className="mt-1">
            <ApplicationInterviewStatusBadge
              status={application.interviewStatus ?? "INTERVIEW_SCHEDULED"}
            />
          </div>
        </div>

        <div>
          <p className="text-muted-foreground">Interview Round</p>
          <p className="mt-1 font-medium">
            {assignment.round?.name?.trim() || "Interview Round"}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Interview Date</p>
          <p className="mt-1 font-medium">
            {formatInterviewDate(assignment.scheduledAt)}
          </p>
        </div>

        <div>
          <p className="text-muted-foreground">Interview Time</p>
          <p className="mt-1 font-medium">
            {formatInterviewTime(assignment.scheduledAt)}
          </p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-sky-100 bg-white/70 p-3">
        <p className="text-sm font-medium text-sky-950">Interview Location / Mode</p>

        <div className="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <p className="text-muted-foreground">Interview Mode</p>
            <p className="mt-1 font-medium">{modeLabel}</p>
          </div>

          {isOnline && meetingLink ? (
            <div className="md:col-span-2">
              <p className="text-muted-foreground">Meeting Link</p>
              <p className="mt-1 break-all text-sm text-sky-900">{meetingLink}</p>
              <div className="mt-2">
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

          {assignment.mode === "PHONE" && assignment.locationOrLink?.trim() ? (
            <div className="md:col-span-2">
              <p className="text-muted-foreground">Contact</p>
              <p className="mt-1 font-medium">
                {assignment.locationOrLink.trim()}
              </p>
            </div>
          ) : null}

          {isOffline ? (
            <>
              {venue ? (
                <div>
                  <p className="text-muted-foreground">Venue</p>
                  <p className="mt-1 font-medium">{venue}</p>
                </div>
              ) : null}
              {branchName ? (
                <div>
                  <p className="text-muted-foreground">Branch</p>
                  <p className="mt-1 font-medium">{branchName}</p>
                </div>
              ) : null}
              {branchAddress ? (
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Branch Address</p>
                  <p className="mt-1 font-medium">{branchAddress}</p>
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 text-sm md:grid-cols-2">
        {branchName ? (
          <div>
            <p className="text-muted-foreground">Assigned Branch</p>
            <p className="mt-1 font-medium">{branchName}</p>
          </div>
        ) : null}
        {interviewerName ? (
          <div>
            <p className="text-muted-foreground">Assigned Interviewer</p>
            <p className="mt-1 font-medium">{interviewerName}</p>
          </div>
        ) : null}
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="rounded-lg border border-sky-200 bg-sky-50 px-4 py-4">
        {content}
      </div>
    );
  }

  return (
    <Card className="space-y-4 border-sky-200 bg-sky-50/60 p-6">{content}</Card>
  );
}
