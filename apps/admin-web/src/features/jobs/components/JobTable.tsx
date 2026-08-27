"use client";

import { useEffect, useRef, useState } from "react";

import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { EMPLOYMENT_TYPES } from "@/src/features/jobs/constants/job.constants";
import { JobActions } from "@/src/features/jobs/components/JobActions";
import { JobStatusBadge } from "@/src/features/jobs/components/JobStatusBadge";
import { getJobLifecycleStatus } from "@/src/features/jobs/hooks/useJobs";
import type { Job } from "@/src/features/jobs/types/job.types";
import { formatInr } from "@/src/features/jobs/utils/job-form.utils";

interface JobTableProps {
  jobs: Job[];
  selectedJobIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  onView: (job: Job) => void;
  onEdit: (job: Job) => void;
  onCopyLink: (job: Job) => void;
  onOpenLink: (job: Job) => void;
  onActivate: (job: Job) => void;
  onDeactivate: (job: Job) => void;
  onArchive: (job: Job) => void;
  onRestore: (job: Job) => void;
}

function employmentLabel(type: Job["employmentType"]) {
  return (
    EMPLOYMENT_TYPES.find((item) => item.value === type)?.label ??
    type.replaceAll("_", " ")
  );
}

function salaryLabel(job: Job) {
  if (job.minSalary == null && job.maxSalary == null) {
    return "—";
  }

  if (job.maxSalary == null || job.maxSalary === job.minSalary) {
    return formatInr(job.minSalary);
  }

  return `${formatInr(job.minSalary)} – ${formatInr(job.maxSalary)}`;
}

export function JobTable({
  jobs,
  selectedJobIds = [],
  onSelectionChange,
  actionsDisabled = false,
  onView,
  onEdit,
  onCopyLink,
  onOpenLink,
  onActivate,
  onDeactivate,
  onArchive,
  onRestore,
}: JobTableProps) {
  const selectAllRef = useRef<HTMLInputElement | null>(null);
  const visibleIds = jobs.map((job) => job.id);
  const selectedVisibleCount = visibleIds.filter((id) =>
    selectedJobIds.includes(id),
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

  const toggleRow = (jobId: string, checked: boolean) => {
    if (!onSelectionChange) {
      return;
    }

    onSelectionChange(
      checked
        ? Array.from(new Set([...selectedJobIds, jobId]))
        : selectedJobIds.filter((id) => id !== jobId),
    );
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!onSelectionChange) {
      return;
    }

    if (!checked) {
      onSelectionChange(
        selectedJobIds.filter((id) => !visibleIds.includes(id)),
      );
      return;
    }

    onSelectionChange(Array.from(new Set([...selectedJobIds, ...visibleIds])));
  };

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No Jobs Found"
        description="Create your first job or adjust your filters."
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
                aria-label="Select all jobs on this page"
              />
            </th>
            <th className="min-w-[180px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Job Title
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Company
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Job Number
            </th>
            <th className="min-w-[140px] px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Location
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Employment Type
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Salary
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status
            </th>
            <th className="whitespace-nowrap px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              Created Date
            </th>
            <th className="w-[13.5rem] px-2 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <tr
              key={job.id}
              className="h-14 bg-white transition-colors hover:bg-[#F8FBFF]"
            >
              <td className="px-3 py-3">
                <Checkbox
                  checked={selectedJobIds.includes(job.id)}
                  onCheckedChange={(checked) => toggleRow(job.id, checked)}
                />
              </td>
              <td className="px-3 py-3 text-sm font-medium text-[#102A56]">
                {job.title}
              </td>
              <td className="px-3 py-3 text-sm text-[#102A56]">
                {job.companyName}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums text-[#647A9B]">
                {job.jobNumber || "—"}
              </td>
              <td className="px-3 py-3 text-sm text-[#102A56]">
                {job.location || job.city || "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm text-[#102A56]">
                {employmentLabel(job.employmentType)}
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm tabular-nums text-[#102A56]">
                {salaryLabel(job)}
              </td>
              <td className="px-3 py-3">
                <JobStatusBadge
                  status={getJobLifecycleStatus(job)}
                  job={job}
                />
              </td>
              <td className="whitespace-nowrap px-3 py-3 text-sm text-[#647A9B]">
                {new Date(job.createdAt).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-2 py-2">
                <JobActions
                  job={job}
                  disabled={actionsDisabled}
                  onView={onView}
                  onEdit={onEdit}
                  onCopyLink={onCopyLink}
                  onOpenLink={onOpenLink}
                  onActivate={onActivate}
                  onDeactivate={onDeactivate}
                  onArchive={onArchive}
                  onRestore={onRestore}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
