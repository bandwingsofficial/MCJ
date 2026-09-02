"use client";

import { useEffect, useRef } from "react";

import { cn } from "@/src/shared/lib/cn";
import { Checkbox } from "@/src/shared/components/ui/checkbox";
import { EmptyState } from "@/src/shared/components/ui/empty-state";

import { EMPLOYMENT_TYPES } from "@/src/features/jobs/constants/job.constants";
import { JobActions } from "@/src/features/jobs/components/JobActions";
import { JobStatusBadge } from "@/src/features/jobs/components/JobStatusBadge";
import { getJobLifecycleStatus } from "@/src/features/jobs/hooks/useJobs";
import { isJobExpired, type Job } from "@/src/features/jobs/types/job.types";
import { formatInr } from "@/src/features/jobs/utils/job-form.utils";

interface JobTableProps {
  jobs: Job[];
  selectedJobIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  actionsDisabled?: boolean;
  selectionDisabled?: boolean;
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

/** Cell backgrounds must be set on <td>; <tr> bg alone does not paint full width with border-collapse. */
function expiredRowCellClass(expired: boolean) {
  return expired
    ? "bg-[#F1F4F8] text-slate-500 group-hover:bg-[#E8EDF3]"
    : "bg-white text-slate-700 group-hover:bg-[#F8FBFF]";
}

function expiredRowTitleCellClass(expired: boolean) {
  return cn(
    expiredRowCellClass(expired),
    "text-sm font-medium",
    expired ? "text-slate-500" : "text-[#102A56]",
  );
}

export function JobTable({
  jobs,
  selectedJobIds = [],
  onSelectionChange,
  actionsDisabled = false,
  selectionDisabled = false,
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
    if (!onSelectionChange || selectionDisabled) {
      return;
    }

    onSelectionChange(
      checked
        ? Array.from(new Set([...selectedJobIds, jobId]))
        : selectedJobIds.filter((id) => id !== jobId),
    );
  };

  const toggleAllVisible = (checked: boolean) => {
    if (!onSelectionChange || selectionDisabled) {
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
                disabled={selectionDisabled}
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
          {jobs.map((job) => {
            const expired = isJobExpired(job);

            return (
              <tr
                key={job.id}
                data-expired={expired || undefined}
                className="group h-14 transition-colors"
              >
                <td className={cn("px-3 py-3", expiredRowCellClass(expired))}>
                  <Checkbox
                    checked={selectedJobIds.includes(job.id)}
                    disabled={selectionDisabled}
                    onCheckedChange={(checked) => toggleRow(job.id, checked)}
                  />
                </td>
                <td className={cn("px-3 py-3", expiredRowTitleCellClass(expired))}>
                  {job.title}
                </td>
                <td
                  className={cn(
                    "px-3 py-3 text-sm",
                    expiredRowCellClass(expired),
                  )}
                >
                  {job.companyName}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-3 py-3 text-sm tabular-nums",
                    expiredRowCellClass(expired),
                  )}
                >
                  {job.jobNumber || "—"}
                </td>
                <td
                  className={cn("px-3 py-3 text-sm", expiredRowCellClass(expired))}
                >
                  {job.location || job.city || "—"}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-3 py-3 text-sm",
                    expiredRowCellClass(expired),
                  )}
                >
                  {employmentLabel(job.employmentType)}
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-3 py-3 text-sm tabular-nums",
                    expiredRowCellClass(expired),
                  )}
                >
                  {salaryLabel(job)}
                </td>
                <td className={cn("px-3 py-3", expiredRowCellClass(expired))}>
                  <JobStatusBadge
                    status={getJobLifecycleStatus(job)}
                    job={job}
                  />
                </td>
                <td
                  className={cn(
                    "whitespace-nowrap px-3 py-3 text-sm",
                    expiredRowCellClass(expired),
                  )}
                >
                  {new Date(job.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td
                  className={cn(
                    "px-2 py-2",
                    expiredRowCellClass(expired),
                    expired && "opacity-90",
                  )}
                >
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
