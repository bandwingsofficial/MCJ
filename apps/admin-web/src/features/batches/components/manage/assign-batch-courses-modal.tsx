"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { AppSelect } from "@/src/shared/components/ui/select";
import { Modal } from "@/src/shared/components/ui/model";

import type { CourseOption } from "@/src/features/batches/types/batch.types";
import { uniqueSelectOptions } from "@/src/features/batches/utils/batch-select.utils";

interface AssignmentDraft {
  id: string;
  courseId?: string;
}

interface Props {
  open: boolean;
  courses: CourseOption[];
  assignedCourseIds: Set<string>;
  isSubmitting?: boolean;
  onClose: () => void;
  onAssign: (assignments: Array<{ courseId: string }>) => Promise<void>;
}

function createDraft(): AssignmentDraft {
  return {
    id: crypto.randomUUID(),
  };
}

export function AssignBatchCoursesModal({
  open,
  courses,
  assignedCourseIds,
  isSubmitting = false,
  onClose,
  onAssign,
}: Props) {
  const [rows, setRows] = useState<AssignmentDraft[]>([createDraft()]);

  const availableCourses = useMemo(
    () => courses.filter((course) => !assignedCourseIds.has(course.id)),
    [assignedCourseIds, courses],
  );

  const resetRows = () => {
    setRows([createDraft()]);
  };

  const handleClose = () => {
    if (isSubmitting) {
      return;
    }

    resetRows();
    onClose();
  };

  const getCourseOptions = (currentRowId: string, currentCourseId?: string) => {
    const selectedInOtherRows = new Set(
      rows
        .filter((row) => row.id !== currentRowId && row.courseId)
        .map((row) => row.courseId!),
    );

    return uniqueSelectOptions(
      availableCourses
        .filter(
          (course) =>
            course.id === currentCourseId ||
            !selectedInOtherRows.has(course.id),
        )
        .map((course) => ({
          label: course.code ? `${course.title} (${course.code})` : course.title,
          value: course.id,
        })),
    );
  };

  const updateRow = (
    rowId: string,
    patch: Partial<Pick<AssignmentDraft, "courseId">>,
  ) => {
    setRows((current) =>
      current.map((row) => (row.id === rowId ? { ...row, ...patch } : row)),
    );
  };

  const addRow = () => {
    setRows((current) => [...current, createDraft()]);
  };

  const removeRow = (rowId: string) => {
    setRows((current) => {
      const next = current.filter((row) => row.id !== rowId);
      return next.length > 0 ? next : [createDraft()];
    });
  };

  const validAssignments = rows.filter(
    (row): row is AssignmentDraft & { courseId: string } => Boolean(row.courseId),
  );

  const canAddAnotherRow =
    validAssignments.length < availableCourses.length &&
    rows.length < availableCourses.length;

  const handleSubmit = async () => {
    if (validAssignments.length === 0) {
      return;
    }

    await onAssign(
      validAssignments.map((row) => ({
        courseId: row.courseId,
      })),
    );

    resetRows();
  };

  return (
    <Modal
      open={open}
      title="Add Courses"
      onClose={handleClose}
      contentClassName="w-[calc(100vw-2rem)] max-w-2xl !overflow-y-auto !overflow-x-hidden"
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Select one or more courses to assign to this batch.
        </p>

        <div className="space-y-3">
          {rows.map((row, index) => (
            <div
              key={row.id}
              className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_auto]"
            >
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500">
                  Course {index + 1}
                </label>
                <AppSelect
                  value={row.courseId}
                  placeholder="Select course"
                  options={getCourseOptions(row.id, row.courseId)}
                  onValueChange={(value) => {
                    updateRow(row.id, { courseId: value });
                  }}
                />
              </div>

              <div className="flex items-end justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSubmitting || rows.length === 1}
                  onClick={() => removeRow(row.id)}
                  aria-label="Remove course row"
                  className="h-9 w-9 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-[1.25rem] w-[1.25rem]" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {canAddAnotherRow ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isSubmitting}
            onClick={addRow}
          >
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Another Course
          </Button>
        ) : null}

        <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || validAssignments.length === 0}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {isSubmitting ? "Saving..." : "Save Assignments"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
