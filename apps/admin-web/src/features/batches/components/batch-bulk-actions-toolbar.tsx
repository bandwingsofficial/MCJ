"use client";

import { Button } from "@/src/shared/components/ui/button";

import type {
  BatchLifecycleStatus,
  BatchListItem,
} from "@/src/features/batches/types/batch.types";
import {
  getEligibleUpcomingDeleteIds,
  isBulkUpcomingDeleteEnabled,
} from "@/src/features/batches/utils/batch-bulk.utils";

export type BulkBatchAction = "delete-upcoming";

interface Props {
  batches: BatchListItem[];
  selectedBatchIds: string[];
  lifecycleTab: BatchLifecycleStatus;
  disabled?: boolean;
  onAction: (action: BulkBatchAction) => void;
}

/** Batch bulk actions are allowed only on the Upcoming tab (Delete only). */
export function BatchBulkActionsToolbar({
  batches,
  selectedBatchIds = [],
  lifecycleTab,
  disabled = false,
  onAction,
}: Props) {
  const selectedCount = selectedBatchIds.length;

  if (lifecycleTab !== "UPCOMING" || selectedCount === 0) {
    return null;
  }

  const upcomingDeleteCount = getEligibleUpcomingDeleteIds(
    batches,
    selectedBatchIds,
  ).length;
  const bulkDeleteEnabled = isBulkUpcomingDeleteEnabled(
    batches,
    selectedBatchIds,
  );

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-800">
        {selectedCount} batch{selectedCount === 1 ? "" : "es"} selected
      </p>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="danger"
          className="h-8"
          disabled={
            disabled || !bulkDeleteEnabled || upcomingDeleteCount === 0
          }
          onClick={() => onAction("delete-upcoming")}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
