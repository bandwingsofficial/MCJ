"use client";

import { useCallback, useEffect, useState } from "react";
import { BookOpen, Link2Off } from "lucide-react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignEntitiesModal,
  type AssignableItem,
} from "@/src/features/branches/components/manage/assign-entities-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import {
  TABLE_CELL_CLASS,
  BranchManageTableShell,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import {
  BRANCH_TAB_COUNT_CLASS,
  BRANCH_TAB_HEADER_CLASS,
  BRANCH_TAB_HEADER_ROW_CLASS,
  BRANCH_TAB_TITLE_CLASS,
  BRANCH_TABLE_CARD_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import { branchService } from "@/src/features/branches/services/branch.service";
import { BRANCH_COURSE_TRAINER_UNASSIGNED_LABEL } from "@/src/features/branches/utils/branch-display.utils";
import { courseService } from "@/src/features/courses/services/course.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
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
      <div className="space-y-3">
        <header className={BRANCH_TAB_HEADER_CLASS}>
          <div className={BRANCH_TAB_HEADER_ROW_CLASS}>
            <div className="flex shrink-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
              <h2 className={BRANCH_TAB_TITLE_CLASS}>Courses</h2>
              <span className={BRANCH_TAB_COUNT_CLASS}>
                Total Courses:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {isLoading ? "—" : courses.length}
                </span>
              </span>
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
          </div>
        </header>

        <div className={BRANCH_TABLE_CARD_CLASS}>
          <BranchManageTableShell
            embedded
            columns={[
              { key: "course", label: "Course" },
              { key: "code", label: "Course Code", className: "w-[9rem]" },
              { key: "category", label: "Category" },
              { key: "trainer", label: "Trainer" },
              { key: "status", label: "Status", className: "w-[8rem]" },
              {
                key: "actions",
                label: "Actions",
                className: "w-[6.75rem] text-right",
              },
            ]}
            isLoading={isLoading}
            isEmpty={!isLoading && courses.length === 0}
            emptyTitle="No Courses Assigned Yet"
            emptyDescription="Assign courses to this branch to get started."
            emptyIcon={BookOpen}
          >
            {courses.map((course) => (
              <tr
                key={course.id}
                className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50"
              >
                <td className={`${TABLE_CELL_CLASS} font-medium text-[#102A56]`}>
                  <span className="block truncate" title={course.title}>
                    {course.title}
                  </span>
                </td>
                <td className={`${TABLE_CELL_CLASS} font-mono text-slate-700`}>
                  {course.code ?? ""}
                </td>
                <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                  <span className="block truncate">
                    {getCourseCategoryDisplayName(course)}
                  </span>
                </td>
                <td className={`${TABLE_CELL_CLASS} text-slate-700`}>
                  <span className="block truncate" title={course.trainerLabel}>
                    {course.trainerLabel}
                  </span>
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <CourseStatusBadge
                    status={course.status}
                    deletedAt={course.deletedAt}
                    isDeleted={course.isDeleted}
                  />
                </td>
                <td className={TABLE_CELL_CLASS}>
                  <div className="flex items-center justify-end gap-2">
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
                  </div>
                </td>
              </tr>
            ))}
          </BranchManageTableShell>
        </div>
      </div>

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
