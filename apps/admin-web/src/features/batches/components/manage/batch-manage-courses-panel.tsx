"use client";

import { useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/src/shared/components/ui/button";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import type {
  BatchCourseAssignment,
  CourseOption,
} from "@/src/features/batches/types/batch.types";
import { batchService } from "@/src/features/batches/services/batch.service";
import {
  COURSE_TRAINER_UNASSIGNED_LABEL,
  formatAssignmentTrainerNames,
  getCourseCategoryName,
} from "@/src/features/batches/utils/batch-course.utils";
import { TrainerStatusBadge } from "@/src/features/trainers/components/trainer-status-badge";

import { AssignBatchCoursesModal } from "./assign-batch-courses-modal";

interface Props {
  batchId: string;
  disabled?: boolean;
  assignments: BatchCourseAssignment[];
  assignmentsLoading?: boolean;
  onAssignmentsChange: (assignments: BatchCourseAssignment[]) => void;
  onUpdated: () => Promise<void>;
}

export function BatchManageCoursesPanel({
  batchId,
  disabled = false,
  assignments,
  assignmentsLoading = false,
  onAssignmentsChange,
  onUpdated,
}: Props) {
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [search, setSearch] = useState("");
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [removeTarget, setRemoveTarget] =
    useState<BatchCourseAssignment | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);

  const loadOptions = async () => {
    setOptionsLoading(true);
    try {
      const courseItems = await batchService.getCourses();
      setCourses(courseItems);
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setOptionsLoading(false);
    }
  };

  useEffect(() => {
    void loadOptions();
  }, [batchId]);

  const scopedAssignments = useMemo(
    () => assignments.filter((item) => item.batchId === batchId),
    [assignments, batchId],
  );

  const assignedCourseIds = useMemo(
    () => new Set(scopedAssignments.map((item) => item.courseId)),
    [scopedAssignments],
  );

  const filteredAssignments = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return scopedAssignments;
    }

    return scopedAssignments.filter((assignment) => {
      const haystack = [
        assignment.course.title,
        assignment.course.code ?? "",
        getCourseCategoryName(assignment),
        formatAssignmentTrainerNames(assignment),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(query);
    });
  }, [scopedAssignments, search]);

  const handleAssignMany = async (
    items: Array<{ courseId: string }>,
  ) => {
    if (!batchId) {
      return;
    }

    setIsAssigning(true);
    try {
      const created: BatchCourseAssignment[] = [];

      for (const item of items) {
        const assignment = await batchService.assignBatchCourse(batchId, item);
        created.push(assignment);
      }

      onAssignmentsChange([...scopedAssignments, ...created]);

      appToast.success(
        items.length === 1
          ? "Course assigned successfully"
          : `${items.length} courses assigned successfully`,
      );
      setAssignOpen(false);
      await onUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
      throw error;
    } finally {
      setIsAssigning(false);
    }
  };

  const handleRemove = async () => {
    if (!removeTarget || !batchId) {
      return;
    }

    setIsRemoving(true);
    try {
      await batchService.removeBatchCourse(batchId, removeTarget.id);
      appToast.success("Course removed from batch");
      setRemoveTarget(null);
      onAssignmentsChange(
        scopedAssignments.filter((item) => item.id !== removeTarget.id),
      );
      await onUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsRemoving(false);
    }
  };

  const isLoading = assignmentsLoading || optionsLoading;

  return (
    <>
      <Card className="rounded-xl border border-slate-200/80 p-4 shadow-sm">
        <BranchSectionToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search courses..."
          assignLabel="Add Course"
          assignDisabled={disabled || isLoading}
          onAssign={() => setAssignOpen(true)}
        />

        <div className="w-full min-w-0 overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full table-fixed border-collapse">
            <colgroup>
              <col className="w-[5.5rem]" />
              <col />
              <col />
              <col />
              <col className="w-[8rem]" />
              <col className="w-[4.5rem]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Session
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Course
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Trainer
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {assignmentsLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-sm text-[#647A9B]"
                  >
                    Loading courses...
                  </td>
                </tr>
              ) : filteredAssignments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center">
                    <p className="text-sm font-medium text-[#102A56]">
                      No courses assigned yet
                    </p>
                    <p className="mt-1 text-sm text-[#647A9B]">
                      Add courses to this batch to get started.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAssignments.map((assignment) => (
                  <tr key={assignment.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-sm font-medium text-[#102A56]">
                      {assignment.session?.code ?? "—"}
                    </td>
                    <td className="truncate px-4 py-3 text-sm font-medium text-[#102A56]">
                      {assignment.course.title}
                    </td>
                    <td className="truncate px-4 py-3 text-sm text-slate-700">
                      {getCourseCategoryName(assignment)}
                    </td>
                    <td className="truncate px-4 py-3 text-sm text-slate-700">
                      {formatAssignmentTrainerNames(assignment) ||
                        COURSE_TRAINER_UNASSIGNED_LABEL}
                    </td>
                    <td className="px-4 py-3">
                      <TrainerStatusBadge
                        status={assignment.isActive ? "ACTIVE" : "INACTIVE"}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={disabled || isRemoving}
                        onClick={() => setRemoveTarget(assignment)}
                        aria-label="Remove course assignment"
                        className="h-9 w-9 rounded-lg p-0 text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <Trash2 className="h-[1.25rem] w-[1.25rem]" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <AssignBatchCoursesModal
        open={assignOpen}
        courses={courses}
        assignedCourseIds={assignedCourseIds}
        isSubmitting={isAssigning}
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssignMany}
      />

      <ConfirmDialog
        open={Boolean(removeTarget)}
        title="Remove course from batch?"
        description={
          removeTarget
            ? `Remove "${removeTarget.course.title}" from this batch? The course will remain in the system.`
            : ""
        }
        confirmLabel="Remove"
        loading={isRemoving}
        onCancel={() => setRemoveTarget(null)}
        onConfirm={() => {
          void handleRemove();
        }}
      />
    </>
  );
}
