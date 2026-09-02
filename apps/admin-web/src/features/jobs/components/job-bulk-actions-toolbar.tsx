"use client";

import { Button } from "@/src/shared/components/ui/button";

import type { Job } from "@/src/features/jobs/types/job.types";
import {
  getEligibleActivateIds,
  getEligibleArchiveIds,
  getEligibleDeactivateIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/jobs/utils/job-bulk.utils";

export type BulkJobAction =
  | "activate"
  | "deactivate"
  | "archive"
  | "restore"
  | "permanent-delete";

interface JobBulkActionsToolbarProps {
  jobs: Job[];
  selectedJobIds: string[];
  disabled?: boolean;
  onAction: (action: BulkJobAction) => void;
}

export function JobBulkActionsToolbar({
  jobs,
  selectedJobIds = [],
  disabled = false,
  onAction,
}: JobBulkActionsToolbarProps) {
  const selectedCount = selectedJobIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(jobs, selectedJobIds).length;
  const deactivateCount = getEligibleDeactivateIds(jobs, selectedJobIds).length;
  const archiveCount = getEligibleArchiveIds(jobs, selectedJobIds).length;
  const restoreCount = getEligibleRestoreIds(jobs, selectedJobIds).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    jobs,
    selectedJobIds,
  ).length;

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-800">
        {selectedCount} job{selectedCount === 1 ? "" : "s"} selected
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          className="h-8"
          disabled={disabled || activateCount === 0}
          onClick={() => onAction("activate")}
        >
          Activate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8"
          disabled={disabled || deactivateCount === 0}
          onClick={() => onAction("deactivate")}
        >
          Deactivate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8"
          disabled={disabled || archiveCount === 0}
          onClick={() => onAction("archive")}
        >
          Archive
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-8"
          disabled={disabled || restoreCount === 0}
          onClick={() => onAction("restore")}
        >
          Restore
        </Button>

        <Button
          type="button"
          variant="danger"
          className="h-8"
          disabled={disabled || permanentDeleteCount === 0}
          onClick={() => onAction("permanent-delete")}
        >
          Permanent Delete
        </Button>
      </div>
    </div>
  );
}
