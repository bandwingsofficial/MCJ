"use client";

import { Loader2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";

import type { CourseListItem } from "@/src/features/courses/types/course.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
  isBulkActionEnabledForSelection,
} from "@/src/features/courses/utils/course-bulk.utils";

export type BulkCourseAction =
  | "activate"
  | "deactivate"
  | "delete"
  | "restore"
  | "permanent-delete";

interface Props {
  courses: CourseListItem[];
  selectedCourseIds: string[];
  disabled?: boolean;
  pendingBulkLifecycleCheck?: "delete" | "deactivate" | null;
  onAction: (action: BulkCourseAction) => void;
}

export function CourseBulkActionsToolbar({
  courses,
  selectedCourseIds = [],
  disabled = false,
  pendingBulkLifecycleCheck = null,
  onAction,
}: Props) {
  const selectedCount = selectedCourseIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(
    courses,
    selectedCourseIds,
  ).length;
  const deactivateCount = getEligibleDeactivateIds(
    courses,
    selectedCourseIds,
  ).length;
  const deleteCount = getEligibleDeleteIds(
    courses,
    selectedCourseIds,
  ).length;
  const restoreCount = getEligibleRestoreIds(
    courses,
    selectedCourseIds,
  ).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    courses,
    selectedCourseIds,
  ).length;

  const checkingDelete = pendingBulkLifecycleCheck === "delete";
  const checkingDeactivate = pendingBulkLifecycleCheck === "deactivate";
  const bulkCheckInFlight = pendingBulkLifecycleCheck !== null;

  const activateEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    activateCount,
  );
  const deactivateEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    deactivateCount,
  );
  const deleteEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    deleteCount,
  );
  const restoreEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    restoreCount,
  );
  const permanentDeleteEnabled = isBulkActionEnabledForSelection(
    selectedCount,
    permanentDeleteCount,
  );

  return (
    <div className="flex flex-col gap-1.5 border-b border-[#2563EB]/15 bg-[#2563EB]/5 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs font-medium text-slate-800">
        {selectedCount} course{selectedCount === 1 ? "" : "s"} selected
      </p>

      <div className="flex flex-wrap gap-1.5">
        <Button
          type="button"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || !activateEnabled || bulkCheckInFlight}
          onClick={() => onAction("activate")}
        >
          Activate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 gap-1 px-2.5 text-xs"
          disabled={disabled || !deactivateEnabled || bulkCheckInFlight}
          aria-busy={checkingDeactivate}
          onClick={() => onAction("deactivate")}
        >
          {checkingDeactivate ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          Deactivate
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 gap-1 px-2.5 text-xs"
          disabled={disabled || !deleteEnabled || bulkCheckInFlight}
          aria-busy={checkingDelete}
          onClick={() => onAction("delete")}
        >
          {checkingDelete ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : null}
          Archive
        </Button>

        <Button
          type="button"
          variant="outline"
          className="h-7 px-2.5 text-xs"
          disabled={disabled || !restoreEnabled || bulkCheckInFlight}
          onClick={() => onAction("restore")}
        >
          Restore
        </Button>

        <Button
          type="button"
          variant="danger"
          className="h-7 px-2.5 text-xs"
          disabled={
            disabled || !permanentDeleteEnabled || bulkCheckInFlight
          }
          onClick={() => onAction("permanent-delete")}
        >
          Permanent Delete
        </Button>
      </div>
    </div>
  );
}
