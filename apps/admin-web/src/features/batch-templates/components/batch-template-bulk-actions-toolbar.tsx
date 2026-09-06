"use client";

import { Button } from "@/src/shared/components/ui/button";

import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";
import {
  getEligibleActivateIds,
  getEligibleArchiveIds,
  getEligibleDeactivateIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/batch-templates/utils/batch-template-bulk.utils";

export type BulkBatchTimingAction =
  | "activate"
  | "deactivate"
  | "archive"
  | "restore"
  | "permanent-delete";

interface Props {
  templates: BatchTemplate[];
  selectedIds: string[];
  disabled?: boolean;
  onAction: (action: BulkBatchTimingAction) => void;
}

export function BatchTemplateBulkActionsToolbar({
  templates,
  selectedIds = [],
  disabled = false,
  onAction,
}: Props) {
  const selectedCount = selectedIds.length;
  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(templates, selectedIds).length;
  const deactivateCount = getEligibleDeactivateIds(
    templates,
    selectedIds,
  ).length;
  const archiveCount = getEligibleArchiveIds(templates, selectedIds).length;
  const restoreCount = getEligibleRestoreIds(templates, selectedIds).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    templates,
    selectedIds,
  ).length;

  const viewingArchived = restoreCount > 0 || permanentDeleteCount > 0;

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-800">
        {selectedCount} batch timing{selectedCount === 1 ? "" : "s"} selected
      </p>

      <div className="flex flex-wrap gap-2">
        {viewingArchived ? (
          <>
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
              Delete Permanently
            </Button>
          </>
        ) : (
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
