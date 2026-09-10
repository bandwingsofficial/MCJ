"use client";

import { useEffect, useRef } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";

import { JobApplicationActions } from "@/src/features/job-applications/components/JobApplicationActions";
import { JobApplicationStatusBadge } from "@/src/features/job-applications/components/JobApplicationStatusBadge";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import {
  getApplicantEmail,
  getApplicantName,
  getApplicantPhone,
} from "@/src/features/job-applications/types/job-application.types";

interface JobApplicationTableProps {
  applications: JobApplication[];
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onView: (application: JobApplication) => void;
  onApprove: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
}

export function JobApplicationTable({
  applications,
  selectedIds = [],
  onSelectionChange,
  actionsDisabled = false,
  emptyTitle = "No Applications Found",
  emptyDescription = "Applications submitted from public job links will appear here.",
  onView,
  onApprove,
  onReject,
}: JobApplicationTableProps) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const columnCount = 9;
  const visibleIds = applications.map((application) => application.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedIds.includes(id),
  ).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected =
    selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  const toggleRow = (id: string, checked: boolean) => {
    if (!onSelectionChange) {
      return;
    }

    onSelectionChange(
      checked
        ? Array.from(new Set([...selectedIds, id]))
        : selectedIds.filter((value) => value !== id),
    );
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!onSelectionChange) {
      return;
    }

    if (!checked) {
      onSelectionChange(selectedIds.filter((id) => !visibleIds.includes(id)));
      return;
    }

    onSelectionChange(Array.from(new Set([...selectedIds, ...visibleIds])));
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full min-w-full border-collapse text-sm">
        <thead className="sticky top-0 z-10 border-b border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] text-[#526581]">
          <tr>
            <th className="w-9 !px-6 !py-4 text-left">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-3.5 w-3.5 rounded border-slate-300"
                checked={allVisibleSelected}
                onChange={(event) => toggleAllVisible(event.target.checked)}
                aria-label="Select all applications on this page"
              />
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
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Email
            </th>
            <th className="!px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Phone
            </th>
            <th className="whitespace-nowrap !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Applied Date
            </th>
            <th className="w-24 !px-4 !py-4 text-left text-[11px] font-semibold tracking-wide text-[#526581]">
              Status
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
            applications.map((application) => (
              <tr
                key={application.id}
                className="cursor-pointer border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
                onClick={() => onView(application)}
              >
                <td
                  className="!px-6 !py-4 align-middle"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedIds.includes(application.id)}
                    onCheckedChange={(checked) =>
                      toggleRow(application.id, Boolean(checked))
                    }
                  />
                </td>
                <td className="!px-4 !py-4 align-middle">
                  <p className="text-sm font-medium leading-snug text-[#102A56]">
                    {getApplicantName(application)}
                  </p>
                  <p className="truncate text-xs text-[#647A9B]">
                    {getApplicantEmail(application)}
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
                <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                  {application.job?.companyName ?? "—"}
                </td>
                <td className="!px-4 !py-4 align-middle text-sm text-slate-700">
                  {getApplicantEmail(application)}
                </td>
                <td className="whitespace-nowrap !px-4 !py-4 align-middle text-sm text-slate-700">
                  {getApplicantPhone(application)}
                </td>
                <td className="whitespace-nowrap !px-4 !py-4 align-middle text-sm text-[#647A9B]">
                  {new Date(application.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="!px-4 !py-4 align-middle">
                  <JobApplicationStatusBadge status={application.status} />
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
