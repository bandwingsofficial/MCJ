"use client";

import { useCallback, useEffect, useState } from "react";
import { Link2Off } from "lucide-react";

import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { Badge } from "@/src/shared/components/ui/badge";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import { BranchManageTableShell } from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import { branchService } from "@/src/features/branches/services/branch.service";
import { BRANCH_COURSE_TRAINER_UNASSIGNED_LABEL } from "@/src/features/branches/utils/branch-display.utils";
import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";
import { trainerService } from "@/src/features/trainers/services/trainer.service";

interface CourseRow extends CourseListItem {
  trainerLabel: string;
}

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  assignOnMount?: boolean;
  onAssignOnMountHandled?: () => void;
  onSummaryRefresh?: () => Promise<void>;
}

function formatTrainerLabel(
  trainers: Array<{ firstName?: string | null; lastName?: string | null }>,
): string {
  const names = trainers
    .map((trainer) =>
      [trainer.firstName, trainer.lastName].filter(Boolean).join(" ").trim(),
    )
    .filter(Boolean);

  return names.join(", ");
}

export function BranchManageCoursesPanel({
  branchId,
  assignmentsDisabled = false,
  assignOnMount = false,
  onAssignOnMountHandled,
  onSummaryRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<CourseRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [assignOpen, setAssignOpen] = useState(false);
  const [assignSearch, setAssignSearch] = useState("");
  const [assignCandidates, setAssignCandidates] = useState<AssignableItem[]>(
    [],
  );
  const [assignLoading, setAssignLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<{
    id: string;
    label: string;
  } | null>(null);
  const [unassignLoading, setUnassignLoading] = useState(false);

  const loadAssignedCourses = useCallback(async () => {
    if (!branchId) {
      return [];
    }

    const courseResponse = await courseService.getCourses({
      search,
      branchId,
      page: 1,
      pageSize: 100,
    });

    const items = (courseResponse.data.items ?? []).filter(
      (item) => !item.isDeleted,
    );

    return Promise.all(
      items.map(async (course) => {
        try {
          const trainers = await trainerService.getTrainersForCourse(course.id);
          return {
            ...course,
            trainerLabel:
              formatTrainerLabel(trainers) ||
              BRANCH_COURSE_TRAINER_UNASSIGNED_LABEL,
          };
        } catch {
          return {
            ...course,
            trainerLabel: BRANCH_COURSE_TRAINER_UNASSIGNED_LABEL,
          };
        }
      }),
    );
  }, [branchId, search]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      setCourses(await loadAssignedCourses());
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  }, [loadAssignedCourses]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openAssign = async () => {
    if (!branchId) {
      return;
    }

    setAssignOpen(true);
    setAssignSearch("");
    setAssignLoading(true);
    try {
      const [assignedResponse, availableResponse] = await Promise.all([
        courseService.getCourses({
          search: "",
          branchId,
          page: 1,
          pageSize: 100,
        }),
        courseService.getCourses({
          search: "",
          status: "ACTIVE",
          page: 1,
          pageSize: 100,
        }),
      ]);
      const assigned = new Set(
        (assignedResponse.data.items ?? [])
          .filter((item) => !item.isDeleted)
          .map((item) => item.id),
      );
      setAssignCandidates(
        (availableResponse.data.items ?? [])
          .filter(
            (item) =>
              item.status === "ACTIVE" &&
              !item.isDeleted &&
              !assigned.has(item.id),
          )
          .map((item) => ({
            id: item.id,
            label: item.title,
            meta: item.code,
            imageUrl: item.thumbnailUrl,
          })),
      );
    } catch (error) {
      appToast.error(getErrorMessage(error));
      setAssignOpen(false);
    } finally {
      setAssignLoading(false);
    }
  };

  useEffect(() => {
    if (!assignOnMount || assignmentsDisabled) {
      return;
    }

    void openAssign();
    onAssignOnMountHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when navigated from overview assign
  }, [assignOnMount, assignmentsDisabled, onAssignOnMountHandled]);

  const handleAssign = async (ids: string[]) => {
    if (ids.length === 0 || !branchId) {
      return;
    }

    setAssignSubmitting(true);
    try {
      await branchService.assignCourses(branchId, ids);
      appToast.success(
        ids.length === 1
          ? "Course assigned successfully"
          : `${ids.length} courses assigned successfully`,
      );
      setAssignOpen(false);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget || !branchId) {
      return;
    }

    setUnassignLoading(true);
    try {
      await branchService.unassignCourse(branchId, unassignTarget.id);
      appToast.success("Course unassigned");
      setUnassignTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setUnassignLoading(false);
    }
  };

  return (
    <>
      <Card className="rounded-xl border border-slate-200 p-4 shadow-sm">
        <div className="mb-3">
          <h2 className="text-lg font-semibold text-slate-900">Courses</h2>
        </div>
        <BranchSectionToolbar
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search courses..."
          assignLabel="Assign Course"
          onAssign={() => {
            void openAssign();
          }}
          assignDisabled={assignmentsDisabled}
        />

        <BranchManageTableShell
          columns={[
            { key: "course", label: "Course" },
            { key: "code", label: "Course Code", className: "w-[9rem]" },
            { key: "category", label: "Category" },
            { key: "trainer", label: "Trainer" },
            { key: "status", label: "Status", className: "w-[8rem]" },
            {
              key: "actions",
              label: "Actions",
              className: "w-[5.5rem] text-right",
            },
          ]}
          isLoading={isLoading}
          isEmpty={!isLoading && courses.length === 0}
          emptyMessage="No courses assigned yet"
          emptyDescription="Assign courses to this branch to get started."
        >
          {courses.map((course) => (
            <tr key={course.id} className="hover:bg-slate-50">
              <td className="truncate px-4 py-3 text-sm font-medium text-slate-900">
                {course.title}
              </td>
              <td className="whitespace-nowrap px-4 py-3 font-mono text-sm text-slate-700">
                {course.code ?? ""}
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {getCourseCategoryDisplayName(course)}
              </td>
              <td className="truncate px-4 py-3 text-sm text-slate-700">
                {course.trainerLabel}
              </td>
              <td className="px-4 py-3">
                <Badge variant="success" className="px-2.5 py-0.5 text-sm">
                  Assigned
                </Badge>
              </td>
              <td className="px-4 py-3 text-right">
                <BranchIconAction
                  icon={Link2Off}
                  label="Unassign"
                  destructive
                  disabled={assignmentsDisabled || unassignLoading}
                  onClick={() =>
                    setUnassignTarget({
                      id: course.id,
                      label: course.title,
                    })
                  }
                />
              </td>
            </tr>
          ))}
        </BranchManageTableShell>
      </Card>

      <AssignEntitiesModal
        open={assignOpen}
        title="Assign Courses"
        items={assignCandidates}
        isLoading={assignLoading}
        isSubmitting={assignSubmitting}
        search={assignSearch}
        onSearchChange={setAssignSearch}
        searchPlaceholder="Search courses..."
        emptyMessage="No active courses available to assign"
        onClose={() => setAssignOpen(false)}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign course?"
        description={`Remove "${unassignTarget?.label ?? "this course"}" from this branch? The course itself will not be deleted.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => setUnassignTarget(null)}
        onConfirm={() => {
          void handleUnassign();
        }}
      />
    </>
  );
}
