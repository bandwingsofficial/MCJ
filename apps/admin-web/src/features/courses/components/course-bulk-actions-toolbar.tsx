"use client";

import { Button } from "@/src/shared/components/ui/button";

import type { CourseListItem } from "@/src/features/courses/types/course.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
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
  onAction: (action: BulkCourseAction) => void;
}

export function CourseBulkActionsToolbar({
  courses,
  selectedCourseIds = [],
  disabled = false,
  onAction,
}: Props) {
  const selectedCount = selectedCourseIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(
    courses,
    selectedCourseIds
  ).length;
  const deactivateCount = getEligibleDeactivateIds(
    courses,
    selectedCourseIds
  ).length;
  const deleteCount = getEligibleDeleteIds(
    courses,
    selectedCourseIds
  ).length;
  const restoreCount = getEligibleRestoreIds(
    courses,
    selectedCourseIds
  ).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    courses,
    selectedCourseIds
  ).length;

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-[#2447A8]/20 bg-[#2447A8]/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-800">
        {selectedCount} course{selectedCount === 1 ? "" : "s"}{" "}
        selected
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
          disabled={disabled || deleteCount === 0}
          onClick={() => onAction("delete")}
        >
          Delete
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
