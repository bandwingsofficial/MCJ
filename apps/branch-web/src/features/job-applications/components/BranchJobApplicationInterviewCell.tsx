"use client";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import { useLifecycleNow } from "@/src/features/branch-interview-lifecycle/use-lifecycle-now";
import { getInterviewRoundAccent } from "@/src/features/interviews/utils/interview-round-accent.utils";
import { resolveJobApplicationListPresentation } from "@/src/features/job-applications/utils/job-application-workflow.utils";

interface Props {
  application: JobApplicationItem;
}

export function BranchJobApplicationInterviewCell({ application }: Props) {
  const nowMs = useLifecycleNow();
  const presentation = resolveJobApplicationListPresentation(application, nowMs);
  const roundAccent = getInterviewRoundAccent({
    roundId: presentation.interviewPrimaryRoundId,
    sortOrder: presentation.interviewPrimaryRoundSortOrder,
  });

  return (
    <div className="min-w-0 max-w-full space-y-0 overflow-hidden text-xs leading-snug">
      <p
        className="truncate text-sm font-semibold leading-tight"
        style={{ color: roundAccent }}
        title={presentation.interviewPrimary}
      >
        {presentation.interviewPrimary}
      </p>
      {presentation.interviewSecondary ? (
        <p className="line-clamp-2 break-words text-[#647A9B]">
          {presentation.interviewSecondary}
        </p>
      ) : null}
      {presentation.interviewTertiary ? (
        <p className="line-clamp-2 break-words text-[#647A9B]">
          {presentation.interviewTertiary.startsWith("Interviewer:") ? (
            <>
              Interviewer:{" "}
              <span className="font-medium text-[#102A56]">
                {presentation.interviewTertiary.replace(/^Interviewer:\s*/, "")}
              </span>
            </>
          ) : (
            presentation.interviewTertiary
          )}
        </p>
      ) : null}
    </div>
  );
}
