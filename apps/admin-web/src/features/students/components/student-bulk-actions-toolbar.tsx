"use client";

import { Button } from "@/src/shared/components/ui/button";

import type { StudentListItem } from "@/src/features/students/types/student.types";
import {
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/students/utils/student-bulk.utils";

export type BulkStudentAction =
  | "activate"
  | "deactivate"
  | "delete"
  | "restore"
  | "permanent-delete";

interface Props {
  students: StudentListItem[];
  selectedStudentIds: string[];
  disabled?: boolean;
  onAction: (action: BulkStudentAction) => void;
}

export function StudentBulkActionsToolbar({
  students,
  selectedStudentIds = [],
  disabled = false,
  onAction,
}: Props) {
  const selectedCount = selectedStudentIds.length;

  if (selectedCount === 0) {
    return null;
  }

  const activateCount = getEligibleActivateIds(
    students,
    selectedStudentIds,
  ).length;
  const deactivateCount = getEligibleDeactivateIds(
    students,
    selectedStudentIds,
  ).length;
  const deleteCount = getEligibleDeleteIds(students, selectedStudentIds).length;
  const restoreCount = getEligibleRestoreIds(students, selectedStudentIds).length;
  const permanentDeleteCount = getEligiblePermanentDeleteIds(
    students,
    selectedStudentIds,
  ).length;

  return (
    <div className="mb-3 flex flex-col gap-2 rounded-lg border border-[#2563EB]/20 bg-[#2563EB]/5 px-3 py-2.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm font-medium text-slate-800">
        {selectedCount} student{selectedCount === 1 ? "" : "s"} selected
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
