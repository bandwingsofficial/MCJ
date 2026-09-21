"use client";

import type { InterviewItem } from "@/src/features/branch-ops/types";
import { BranchInterviewActions } from "@/src/features/interviews/components/BranchInterviewActions";
import {
  formatInterviewDate,
  formatInterviewMode,
  formatInterviewStatusLabel,
  formatInterviewTime,
  getInterviewRelativeLabel,
  getInterviewStatusVariant,
  getInterviewerDisplayName,
  isValidInterviewSchedule,
} from "@/src/features/interviews/utils/interview-display.utils";
import { Badge } from "@/src/shared/components/ui/badge";

const compactClass = "px-2 py-0 text-[11px] font-semibold leading-5";

interface Props {
  interviews: InterviewItem[];
  actionsDisabled?: boolean;
  onView: (interview: InterviewItem) => void;
  onManage: (interview: InterviewItem) => void;
}

const COLUMN_COUNT = 8;

export function BranchInterviewsTable({
  interviews,
  actionsDisabled = false,
  onView,
  onManage,
}: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Interview
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Candidate
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Job
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Interviewer
            </th>
            <th className="min-w-[10rem] !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              When
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Mode
            </th>
            <th className="w-28 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
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
              .map((interview) => (
                <tr
                  key={interview.id}
                  className="cursor-pointer border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                  onClick={() => onView(interview)}
                >
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm font-medium text-[#102A56]">
                      Round {interview.roundNumber ?? 1}
                    </p>
                    <p className="font-mono text-xs text-[#647A9B]">
                      {interview.application?.applicationNumber ??
                        interview.applicationId.slice(0, 8)}
                    </p>
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm font-medium leading-snug text-[#102A56]">
                      {interview.application?.candidateName ?? "—"}
                    </p>
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm text-[#102A56]">
                      {interview.job?.title ?? "—"}
                    </p>
                    {interview.job?.companyName ? (
                      <p className="text-xs text-[#647A9B]">
                        {interview.job.companyName}
                      </p>
                    ) : null}
                  </td>
                  <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                    {getInterviewerDisplayName(interview)}
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm text-[#102A56]">
                      {formatInterviewDate(interview.scheduledAt)}
                    </p>
                    <p className="text-xs text-[#647A9B]">
                      {formatInterviewTime(interview.scheduledAt)}
                    </p>
                    <p className="mt-0.5 text-xs font-medium text-[#2563EB]">
                      {getInterviewRelativeLabel(
                        interview.scheduledAt,
                        interview.status,
                      )}
                    </p>
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm text-[#102A56]">
                      {formatInterviewMode(interview.mode)}
                    </p>
                    {interview.mode === "ONLINE" && interview.locationOrLink ? (
                      <a
                        href={interview.locationOrLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-[#2563EB] hover:underline"
                        onClick={(event) => event.stopPropagation()}
                      >
                        Meeting link
                      </a>
                    ) : null}
                    {interview.mode === "OFFLINE" && interview.locationOrLink ? (
                      <p className="text-xs text-[#647A9B]">
                        {interview.locationOrLink}
                      </p>
                    ) : null}
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <Badge
                      variant={getInterviewStatusVariant(interview.status)}
                      className={compactClass}
                    >
                      {formatInterviewStatusLabel(interview.status)}
                    </Badge>
                  </td>
                  <td
                    className="!px-8 !py-4 text-right align-middle"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <BranchInterviewActions
                      interview={interview}
                      disabled={actionsDisabled}
                      onView={onView}
                      onManage={onManage}
                    />
                  </td>
                </tr>
              ))
          )}
        </tbody>
      </table>
    </div>
  );
}
