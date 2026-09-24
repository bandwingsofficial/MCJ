"use client";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import { BranchJobApplicationActions } from "@/src/features/job-applications/components/BranchJobApplicationActions";
import { BranchJobApplicationInterviewCell } from "@/src/features/job-applications/components/BranchJobApplicationInterviewCell";
import { BranchJobApplicationStatusCell } from "@/src/features/job-applications/components/BranchJobApplicationStatusCell";
import { formatAppliedDateLine } from "@/src/features/job-applications/utils/job-application-display.utils";

interface Props {
  applications: JobApplicationItem[];
  actionsDisabled?: boolean;
  onView: (application: JobApplicationItem) => void;
  onSchedule: (application: JobApplicationItem) => void;
}

const COLUMN_COUNT = 6;

const cellClass =
"min-w-0 max-w-0 overflow-hidden !px-3 !py-3 align-top";
const cellInnerClass = "min-w-0 max-w-full overflow-hidden";

/**
 * Content-heavy columns get more width; Status + Actions stay tight.
 * Company gets more space, while Interview is reduced slightly.
 */
const COL_WIDTHS = [
  "19%",      // Candidate
  "14%",      // Job ↑
  "24%",      // Company
  "20%",      // Interview
  "13%",      // Status
  "4.75rem",  // Actions
] as const;

export function BranchJobApplicationsTable({
  applications,
  actionsDisabled = false,
  onView,
  onSchedule,
}: Props) {
  return (
    <div className="w-full overflow-hidden ">
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
              Interview
            </th>

            <th
              className={`${cellClass} !px-1.5 text-left text-[11px] font-semibold tracking-wide`}
            >
              Status
            </th>

            <th
              className={`${cellClass} !px-1 text-right text-[11px] font-semibold tracking-wide text-slate-500`}
            >
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-100">
          {applications.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMN_COUNT}
                className="!px-4 !py-4 align-middle"
              >
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold text-[#102A56]">
                    No assigned job applications
                  </h3>

                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    Applications assigned to this branch by Admin will appear
                    here for interview scheduling.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            applications.map((application) => (
              <tr
                key={application.id}
                className="cursor-pointer border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                onClick={() => onView(application)}
              >
                <td className={cellClass}>
                  <div className={cellInnerClass}>
                    <p className="block w-full truncate text-sm font-medium leading-snug text-[#102A56]">
                      {application.applicantName ?? "—"}
                    </p>

                    {application.applicantEmail ? (
                      <p
                        className="block w-full truncate text-xs text-[#647A9B]"
                        title={application.applicantEmail}
                      >
                        {application.applicantEmail}
                      </p>
                    ) : null}

                    <p
                      className="mt-0.5 block w-full truncate font-mono text-xs text-[#647A9B]"
                      title={application.applicationNumber}
                    >
                      {application.applicationNumber}
                    </p>
                  </div>
                </td>

                <td className={cellClass}>
                  <div className={cellInnerClass}>
                    <p className="block w-full truncate text-sm text-[#102A56]">
                      {application.job?.title ?? "—"}
                    </p>

                    {application.job?.jobNumber ? (
                      <p className="block w-full truncate text-xs text-[#647A9B]">
                        {application.job.jobNumber}
                      </p>
                    ) : null}
                  </div>
                </td>

                <td className={cellClass}>
                  <div className={cellInnerClass}>
                    <p
                      className="line-clamp-2 text-sm leading-snug text-slate-700"
                      title={application.job?.companyName ?? undefined}
                    >
                      {application.job?.companyName ?? "—"}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-[#647A9B]">
                      {formatAppliedDateLine(application.createdAt)}
                    </p>
                  </div>
                </td>

                <td className={cellClass}>
                  <BranchJobApplicationInterviewCell
                    application={application}
                  />
                </td>

                <td className={`${cellClass} !px-1.5`}>
                  <BranchJobApplicationStatusCell
                    application={application}
                  />
                </td>

                <td
                  className={`${cellClass} !px-1 text-right align-middle`}
                  onClick={(event) => event.stopPropagation()}
                >
                  <BranchJobApplicationActions
                    application={application}
                    disabled={actionsDisabled}
                    onView={onView}
                    onSchedule={onSchedule}
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