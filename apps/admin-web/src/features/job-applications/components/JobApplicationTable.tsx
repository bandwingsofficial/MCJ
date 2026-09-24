"use client";

import { JobApplicationActions } from "@/src/features/job-applications/components/JobApplicationActions";
import { JobApplicationAssignmentStatusCell } from "@/src/features/job-applications/components/JobApplicationAssignmentStatusCell";
import { JobApplicationInterviewStatusBadge } from "@/src/features/job-applications/components/JobApplicationInterviewStatusBadge";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  getApplicantEmail,
  getApplicantName,
  getStudentCode,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationTableProps {
  applications: JobApplication[];
  actionsDisabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onView: (application: JobApplication) => void;
  onApprove: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
  onAssignInterview?: (application: JobApplication) => void;
  onUnassignInterview?: (application: JobApplication) => void;
  onPermanentDelete?: (application: JobApplication) => void;
}

function formatAppliedDateLabel(createdAt: string): string {
  return new Date(createdAt).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function JobApplicationTable({
  applications,
  actionsDisabled = false,
  emptyTitle = "No Applications Found",
  emptyDescription = "Applications submitted from public job links will appear here.",
  onView,
  onApprove,
  onReject,
  onAssignInterview,
  onUnassignInterview,
  onPermanentDelete,
}: JobApplicationTableProps) {
  const columnCount = 6;

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Candidate
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Job
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Company
            </th>
            <th className="w-28 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Assignment Status
            </th>
            <th className="w-32 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Interview Status
            </th>
            <th className="w-[6.75rem] !px-8 !py-4 text-right text-[11px] font-semibold tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.length === 0 ? (
            <tr>
              <td colSpan={columnCount} className="!px-4 !py-4 align-middle">
                <div className="flex min-h-[120px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 px-4 py-4 text-center">
                  <h3 className="text-base font-semibold">{emptyTitle}</h3>
                  <p className="mt-1 max-w-md text-sm text-[#647A9B]">
                    {emptyDescription}
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            applications.map((application) => {
              const candidateName = getApplicantName(application);
              const candidateEmail = getApplicantEmail(application);
              const studentCode = getStudentCode(application);
              const companyName = application.job?.companyName?.trim() || "—";
              const appliedLabel = formatAppliedDateLabel(application.createdAt);

              return (
                <tr
                  key={application.id}
                  className="cursor-pointer border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                  onClick={() => onView(application)}
                >
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm font-semibold leading-snug text-[#102A56]">
                      {candidateName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-[#647A9B]">
                      {candidateEmail}
                    </p>
                    <p className="mt-0.5 font-mono text-xs font-medium text-[#2563D9]">
                      {studentCode}
                    </p>
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
                  <td className="!px-4 !py-4 align-middle">
                    <p className="text-sm text-slate-700">{companyName}</p>
                    <p className="mt-0.5 text-xs text-[#647A9B]">
                      Applied: {appliedLabel}
                    </p>
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <JobApplicationAssignmentStatusCell
                      application={application}
                    />
                  </td>
                  <td className="!px-4 !py-4 align-middle">
                    <JobApplicationInterviewStatusBadge
                      application={application}
                    />
                  </td>
                  <td
                    className="!px-8 !py-4 text-right align-middle"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <JobApplicationActions
                      application={application}
                      disabled={actionsDisabled}
                      onView={onView}
                      onApprove={onApprove}
                      onReject={onReject}
                      onAssignInterview={onAssignInterview}
                      onUnassignInterview={onUnassignInterview}
                      onPermanentDelete={onPermanentDelete}
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
