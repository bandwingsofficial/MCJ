"use client";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import { Badge } from "@/src/shared/components/ui/badge";
import {
  formatInterviewDateTime,
  formatInterviewMode,
  getInterviewerName,
  isInterviewScheduled,
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

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="info" className={compactClass}>
          Assigned
        </Badge>
        {scheduled ? (
          <Badge variant="success" className={compactClass}>
            Scheduled
          </Badge>
        ) : (
          <Badge variant="warning" className={compactClass}>
            Not Scheduled
          </Badge>
        )}
      </div>
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
