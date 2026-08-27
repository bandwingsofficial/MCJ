"use client";

import { useEffect, useRef } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

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
  onView: (application: JobApplication) => void;
  onAccept: (application: JobApplication) => void;
  onReject: (application: JobApplication) => void;
}

export function JobApplicationTable({
  applications,
  selectedIds = [],
  onSelectionChange,
  actionsDisabled = false,
  onView,
  onAccept,
  onReject,
}: JobApplicationTableProps) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);
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

  if (applications.length === 0) {
    return (
      <EmptyState
        title="No Applications Found"
        description="Applications submitted from public job links will appear here."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse">
        <thead className="sticky top-0 z-10 border-b border-slate-200 bg-[#F6F9FD]">
          <tr>
            <th className="w-11 px-3 py-3 text-left">
              <input
                ref={selectAllRef}
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300"
                checked={allVisibleSelected}
                onChange={(event) => toggleAllVisible(event.target.checked)}
                aria-label="Select all applications on this page"
              />
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Application No.
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Candidate
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Job
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Company
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Email
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Phone
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Applied Date
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="w-[8.5rem] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {applications.map((application) => (
            <tr
              key={application.id}
              className="h-14 cursor-pointer bg-white transition-colors hover:bg-[#F8FBFF]"
              onClick={() => onView(application)}
            >
              <td
                className="px-3 py-3"
                onClick={(event) => event.stopPropagation()}
              >
                <Checkbox
                  checked={selectedIds.includes(application.id)}
                  onCheckedChange={(checked) =>
                    toggleRow(application.id, checked)
                  }
                />
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums text-[#102A56]">
                {application.applicationNumber || "—"}
              </td>
              <td className="px-3 py-3 text-sm font-medium text-[#102A56]">
                {getApplicantName(application)}
              </td>
              <td className="px-3 py-3 text-sm text-[#102A56]">
                {application.job?.title ?? "—"}
              </td>
              <td className="px-3 py-3 text-sm text-[#102A56]">
                {application.job?.companyName ?? "—"}
              </td>
              <td className="px-3 py-3 text-sm text-[#647A9B]">
                {getApplicantEmail(application)}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm text-[#647A9B]">
                {getApplicantPhone(application)}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm text-[#647A9B]">
                {new Date(application.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-3 py-3">
                <JobApplicationStatusBadge status={application.status} />
              </td>
              <td
                className="px-2 py-2"
                onClick={(event) => event.stopPropagation()}
              >
                <JobApplicationActions
                  application={application}
                  disabled={actionsDisabled}
                  onView={onView}
                  onAccept={onAccept}
                  onReject={onReject}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
