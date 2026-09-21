"use client";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import { Badge } from "@/src/shared/components/ui/badge";
import {
  formatInterviewDateTime,
  formatInterviewMode,
  getBranchCurrentRoundLabel,
  getBranchNextRoundLabel,
  getInterviewerName,
  isInterviewScheduled,
  resolveBranchInterviewDisplay,
} from "@/src/features/job-applications/utils/job-application-display.utils";

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

interface Props {
  application: JobApplicationItem;
}

export function BranchInterviewAssignmentCell({ application }: Props) {
  const interview = application.latestInterview;
  const interviewerName = getInterviewerName(interview);
  const scheduled = isInterviewScheduled(interview);
  const modeLabel = formatInterviewMode(interview?.mode);
  const interviewDisplay = resolveBranchInterviewDisplay(interview);
  const currentRound = getBranchCurrentRoundLabel(application);
  const nextRound = getBranchNextRoundLabel(application);

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="info" className={compactClass}>
          ASSIGNED
        </Badge>
        <Badge variant={interviewDisplay.variant} className={compactClass}>
          {interviewDisplay.label}
        </Badge>
      </div>
      <p className="text-xs text-[#647A9B]">
        Current Round:{" "}
        <span className="font-medium text-[#102A56]">{currentRound}</span>
      </p>
      <p className="text-xs text-[#647A9B]">
        Next Round:{" "}
        <span className="font-medium text-[#102A56]">{nextRound}</span>
      </p>
      {interviewerName ? (
        <p className="text-xs text-[#647A9B]">Interviewer: {interviewerName}</p>
      ) : null}
      {scheduled && interview?.scheduledAt ? (
        <p className="text-xs text-[#102A56]">
          {formatInterviewDateTime(interview.scheduledAt)}
          {modeLabel ? ` · ${modeLabel}` : ""}
        </p>
      ) : null}
    </div>
  );
}
