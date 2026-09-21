"use client";

import type { JobApplicationItem } from "@/src/features/branch-ops/types";
import { BranchInterviewAssignmentCell } from "@/src/features/job-applications/components/BranchInterviewAssignmentCell";
import { BranchJobApplicationActions } from "@/src/features/job-applications/components/BranchJobApplicationActions";
import { BranchJobApplicationStatusBadge } from "@/src/features/job-applications/components/BranchJobApplicationStatusBadge";
import { formatAppliedDate } from "@/src/features/job-applications/utils/job-application-display.utils";

interface Props {
  applications: JobApplicationItem[];
  actionsDisabled?: boolean;
  onView: (application: JobApplicationItem) => void;
  onSchedule: (application: JobApplicationItem) => void;
}

const COLUMN_COUNT = 8;

export function BranchJobApplicationsTable({
  applications,
  actionsDisabled = false,
  onView,
  onSchedule,
}: Props) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Application
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Candidate
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Job
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Company
            </th>
            <th className="whitespace-nowrap !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Applied Date
            </th>
            <th className="w-28 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
            </th>
            <th className="min-w-[14rem] !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Assignment / Interview
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.length === 0 ? (
            <tr>
              <td colSpan={COLUMN_COUNT} className="!px-4 !py-4 align-middle">
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
                <td className="!px-4 !py-4 align-middle">
                  <p className="font-mono text-sm font-medium text-[#2563D9]">
                    {application.applicationNumber}
                  </p>
                </td>
                <td className="!px-4 !py-4 align-middle">
                  <p className="text-sm font-medium leading-snug text-[#102A56]">
                    {application.applicantName ?? "—"}
                  </p>
                  {application.applicantEmail ? (
                    <p className="text-xs text-[#647A9B]">
                      {application.applicantEmail}
                    </p>
                  ) : null}
                </td>
                <td className="!px-4 !py-4 align-middle">
                  <p className="text-sm text-[#102A56]">
                    {application.job?.title ?? "—"}
                  </p>
                  {application.job?.jobNumber ? (
                    <p className="text-xs text-[#647A9B]">
                      {application.job.jobNumber}
                    </p>
                  ) : null}
                </td>
                <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                  {application.job?.companyName ?? "—"}
                </td>
                <td className="whitespace-nowrap !px-4 !py-4 align-middle text-sm text-[#647A9B]">
                  {formatAppliedDate(application.createdAt)}
                </td>
                <td className="!px-4 !py-4 align-middle">
                  <BranchJobApplicationStatusBadge
                    status={application.status}
                  />
                </td>
                <td className="!px-4 !py-4 align-middle">
                  <BranchInterviewAssignmentCell application={application} />
                </td>
                <td
                  className="!px-8 !py-4 text-right align-middle"
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
