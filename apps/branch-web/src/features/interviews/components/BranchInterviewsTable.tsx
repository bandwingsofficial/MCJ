"use client";

import type { InterviewItem } from "@/src/features/branch-ops/types";
import { BranchInterviewActions } from "@/src/features/interviews/components/BranchInterviewActions";
import { getInterviewWhenLabel } from "@/src/features/branch-interview-lifecycle/interview-presentation";
import { useLifecycleNow } from "@/src/features/branch-interview-lifecycle/use-lifecycle-now";
import {
  formatInterviewDate,
  formatInterviewMode,
  formatInterviewTime,
  getInterviewerDisplayName,
  isValidInterviewSchedule,
} from "@/src/features/interviews/utils/interview-display.utils";

interface Props {
  interviews: InterviewItem[];
  actionsDisabled?: boolean;
  onView: (interview: InterviewItem) => void;
  onRecordResult: (interview: InterviewItem) => void;
}

const COLUMN_COUNT = 8;

const cellClass =
  "min-w-0 max-w-0 overflow-hidden !px-3 !py-3 align-middle";
const cellInnerClass = "min-w-0 max-w-full overflow-hidden";

const COL_WIDTHS = [
  "9rem",   // Interview
  "14%",    // Candidate
  "13%",    // Job
  "18%",    // Company
  "14%",    // Interviewer
  "17%",    // Round / schedule
  "5.5rem", // Mode
  "4.75rem", // Actions
] as const;

export function BranchInterviewsTable({
  interviews,
  actionsDisabled = false,
  onView,
  onRecordResult,
}: Props) {
  const nowMs = useLifecycleNow();

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-sm">
        <colgroup>
          {COL_WIDTHS.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            <th
              className={`${cellClass} text-left text-[11px] font-semibold tracking-wide`}
            >
              Interview
            </th>
            <th
              className={`${cellClass} text-left text-[11px] font-semibold tracking-wide`}
            >
              Candidate
            </th>
            <th
              className={`${cellClass} text-left text-[11px] font-semibold tracking-wide`}
            >
              Job
            </th>
            <th
              className={`${cellClass} text-left text-[11px] font-semibold tracking-wide`}
            >
              Company
            </th>
            <th
              className={`${cellClass} text-left text-[11px] font-semibold tracking-wide`}
            >
              Interviewer
            </th>
            <th
              className={`${cellClass} text-left text-[11px] font-semibold tracking-wide`}
            >
              Round
            </th>
            <th
              className={`${cellClass} text-left text-[11px] font-semibold tracking-wide`}
            >
              Mode
            </th>
            <th
              className={`${cellClass} !px-2 text-right text-[11px] font-semibold tracking-wide text-slate-500`}
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {interviews.length === 0 ? (
            <tr>
              <td colSpan={COLUMN_COUNT} className="!px-4 !py-4 align-middle">
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold text-[#102A56]">
                    No interviews scheduled yet
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    Interviews will appear here once a shortlisted candidate has
                    an interview date and time scheduled from Job Applications.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            interviews
              .filter((item) => isValidInterviewSchedule(item.scheduledAt))
              .map((interview) => {
                return (
                  <tr
                    key={interview.id}
                    className="cursor-pointer border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                    onClick={() => onView(interview)}
                  >
                    <td className={cellClass}>
                      <div className={cellInnerClass}>
                        <p className="truncate font-mono text-sm font-medium text-[#102A56]">
                          {interview.application?.applicationNumber ??
                            interview.applicationId.slice(0, 8)}
                        </p>
                      </div>
                    </td>
                    <td className={cellClass}>
                      <div className={cellInnerClass}>
                        <p className="truncate text-sm font-medium leading-snug text-[#102A56]">
                          {interview.application?.candidateName ?? "—"}
                        </p>
                      </div>
                    </td>
                    <td className={cellClass}>
                      <div className={cellInnerClass}>
                        <p className="truncate text-sm text-[#102A56]">
                          {interview.job?.title ?? "—"}
                        </p>
                      </div>
                    </td>
                    <td className={cellClass}>
                      <div className={cellInnerClass}>
                        <p className="truncate text-sm text-slate-700">
                          {interview.job?.companyName ?? "—"}
                        </p>
                      </div>
                    </td>
                    <td className={cellClass}>
                      <div className={cellInnerClass}>
                        <p className="truncate text-sm text-slate-700">
                          {getInterviewerDisplayName(interview)}
                        </p>
                      </div>
                    </td>
                    <td className={cellClass}>
                      <div className={cellInnerClass}>
                        <p className="truncate text-sm font-medium text-[#102A56]">
                          {interview.round?.name ?? "—"}
                        </p>
                        <p className="truncate text-xs text-[#647A9B]">
                          {formatInterviewDate(interview.scheduledAt)}{" "}
                          {formatInterviewTime(interview.scheduledAt)}
                        </p>
                        <p className="mt-0.5 truncate text-xs font-medium text-[#2563EB]">
                          {getInterviewWhenLabel(interview, nowMs)}
                        </p>
                      </div>
                    </td>
                    <td className={cellClass}>
                      <div className={cellInnerClass}>
                        <p className="truncate text-sm text-[#102A56]">
                          {formatInterviewMode(interview.mode)}
                        </p>
                      </div>
                    </td>
                    <td
                      className={`${cellClass} !px-2 text-right`}
                      onClick={(event) => event.stopPropagation()}
                    >
                      <BranchInterviewActions
                        interview={interview}
                        disabled={actionsDisabled}
                        onView={onView}
                        onRecordResult={onRecordResult}
                      />
                    </td>
                  </tr>
                );
              })
          )}
        </tbody>
      </table>
    </div>
  );
}
