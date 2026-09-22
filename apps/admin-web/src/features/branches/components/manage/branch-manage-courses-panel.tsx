"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BookOpen, Link2Off } from "lucide-react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

import { AssignBranchCourseModal } from "@/src/features/branches/components/manage/assign-branch-course-modal";
import { BranchIconAction } from "@/src/features/branches/components/manage/branch-icon-action";
import {
  TABLE_CELL_CLASS,
  BranchManageTableShell,
} from "@/src/features/branches/components/manage/branch-manage-table-shell";
import { BranchSectionToolbar } from "@/src/features/branches/components/manage/branch-section-toolbar";
import {
  BRANCH_PAGINATION_FOOTER_CLASS,
  BRANCH_TAB_COUNT_CLASS,
  BRANCH_TAB_HEADER_CLASS,
  BRANCH_TAB_HEADER_ROW_CLASS,
  BRANCH_TAB_TITLE_CLASS,
  BRANCH_TABLE_CARD_CLASS,
} from "@/src/features/branches/components/manage/branch-manage-layout.constants";
import {
  filterAssignedBranchCourses,
  getActiveCoursesForBranchAssignment,
  isCourseAssignedViaBranchBatch,
  loadBranchAssignedCourses,
} from "@/src/features/branches/utils/branch-course-relation.utils";
import { branchService } from "@/src/features/branches/services/branch.service";
import type { CourseListItem } from "@/src/features/courses/types/course.types";
import { CourseStatusBadge } from "@/src/features/courses/components/course-status-badge";
import { getCourseCategoryDisplayName } from "@/src/features/courses/utils/course-category.utils";

const DEFAULT_COURSE_PAGE_SIZE = 20;
const ALREADY_ASSIGNED_LABEL = "ALREADY ASSIGNED";

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  assignOnMount?: boolean;
  onAssignOnMountHandled?: () => void;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageCoursesPanel({
  branchId,
  assignmentsDisabled = false,
  assignOnMount = false,
  onAssignOnMountHandled,
  onSummaryRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [assignedCourses, setAssignedCourses] = useState<CourseListItem[]>([]);
  const [batchAssignedCourseIds, setBatchAssignedCourseIds] = useState<
    Set<string>
  >(new Set());
  const [manualBranchCourseIds, setManualBranchCourseIds] = useState<
    Set<string>
  >(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableCourses, setAvailableCourses] = useState<CourseListItem[]>([]);
  const [modalAssignedCourseIds, setModalAssignedCourseIds] = useState<
    string[]
  >([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignModalLoading, setAssignModalLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<CourseListItem | null>(
    null,
  );
  const [unassignLoading, setUnassignLoading] = useState(false);

  const pageSize = DEFAULT_COURSE_PAGE_SIZE;

  const filteredCourses = useMemo(
    () => filterAssignedBranchCourses(assignedCourses, search),
    [assignedCourses, search],
  );

  const total = filteredCourses.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedCourses = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCourses.slice(start, start + pageSize);
  }, [filteredCourses, page, pageSize]);

  const assignedCourseIds = useMemo(
    () => new Set(assignedCourses.map((course) => course.id)),
    [assignedCourses],
  );

  const loadData = useCallback(async () => {
    if (!branchId) {
      setAssignedCourses([]);
      setBatchAssignedCourseIds(new Set());
      setManualBranchCourseIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {
        courses,
        batchAssignedCourseIds: batchCourseIds,
        manualBranchCourseIds: manualCourseIds,
      } = await loadBranchAssignedCourses(branchId);

      setAssignedCourses(courses);
      setBatchAssignedCourseIds(batchCourseIds);
      setManualBranchCourseIds(manualCourseIds);
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      setError(message);
      setAssignedCourses([]);
      setBatchAssignedCourseIds(new Set());
      setManualBranchCourseIds(new Set());
      appToast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [branchId]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const loadAvailableCourses = useCallback(async () => {
    setAssignModalLoading(true);
    try {
      const [{ assignedCourseIds: assignedIds }, activeCourses] =
        await Promise.all([
          loadBranchAssignedCourses(branchId),
          getActiveCoursesForBranchAssignment(),
        ]);

      setAvailableCourses(activeCourses);
      setModalAssignedCourseIds(Array.from(assignedIds));
    } catch (loadError) {
      appToast.error(getErrorMessage(loadError));
      setAssignOpen(false);
    } finally {
      setAssignModalLoading(false);
    }
  }, [branchId]);

  const openAssignModal = async () => {
    setModalAssignedCourseIds(Array.from(assignedCourseIds));
    setAssignOpen(true);
    await loadAvailableCourses();
  };

  const closeAssignModal = () => {
    if (assignSubmitting) {
      return;
    }

    setAssignOpen(false);
  };

  useEffect(() => {
    if (!assignOnMount || assignmentsDisabled) {
      return;
    }

    void openAssignModal();
    onAssignOnMountHandled?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once when navigated from overview assign
  }, [assignOnMount, assignmentsDisabled, onAssignOnMountHandled]);

  const handleAssign = async (courseIds: string[]) => {
    const uniqueCourseIds = Array.from(new Set(courseIds)).filter(
      (courseId) => !assignedCourseIds.has(courseId),
    );

    if (uniqueCourseIds.length === 0) {
      appToast.error(
        "Selected courses are already assigned to this branch.",
      );
      return;
    }

    setAssignSubmitting(true);
    try {
      await branchService.assignCourses(branchId, uniqueCourseIds);
      appToast.success(
        uniqueCourseIds.length === 1
          ? "Course assigned successfully"
          : `${uniqueCourseIds.length} courses assigned successfully`,
      );
      setAssignOpen(false);
      await loadData();
      await onSummaryRefresh?.();
    } catch (assignError) {
      appToast.error(getErrorMessage(assignError));
    } finally {
      setAssignSubmitting(false);
    }
  };

  const handleUnassign = async () => {
    if (!unassignTarget) {
      return;
    }

    if (
      isCourseAssignedViaBranchBatch(
        unassignTarget.id,
        batchAssignedCourseIds,
      )
    ) {
      appToast.error(
        "This course is assigned through a batch and cannot be unassigned here.",
      );
      setUnassignTarget(null);
      return;
    }

    if (!manualBranchCourseIds.has(unassignTarget.id)) {
      appToast.error("This course is not manually assigned to this branch.");
      setUnassignTarget(null);
      return;
    }

    setUnassignLoading(true);
    try {
      await branchService.unassignCourse(branchId, unassignTarget.id);
      appToast.success("Course unassigned");
      setUnassignTarget(null);
      await loadData();
      await onSummaryRefresh?.();
    } catch (unassignError) {
      appToast.error(getErrorMessage(unassignError));
    } finally {
      setUnassignLoading(false);
    }
  };

  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  if (error && assignedCourses.length === 0 && !isLoading) {
    return (
      <ErrorState
        title="Failed to load courses"
        description={error}
        onRetry={() => {
          void loadData();
        }}
      />
    );
  }

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
                  {isLoading ? "—" : assignedCourses.length}
                </span>
              </span>
            </div>

            <BranchSectionToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search courses..."
              assignLabel="Assign Course"
              assignDisabled={assignmentsDisabled}
              onAssign={() => {
                void openAssignModal();
              }}
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
              { key: "status", label: "Status", className: "w-[8rem]" },
              {
                key: "actions",
                label: "Actions",
                className: "w-[10.5rem] text-right",
              },
            ]}
            isLoading={isLoading}
            isEmpty={!isLoading && total === 0}
            emptyTitle="No Courses Assigned Yet"
            emptyDescription="Assign courses to this branch to get started."
            emptyIcon={BookOpen}
          >
            {paginatedCourses.map((course) => {
              const isBatchAssigned = isCourseAssignedViaBranchBatch(
                course.id,
                batchAssignedCourseIds,
              );
              const canUnassign =
                manualBranchCourseIds.has(course.id) && !isBatchAssigned;

              return (
                <tr
                  key={course.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors",
                    isBatchAssigned
                      ? "cursor-not-allowed bg-slate-50/80 text-slate-500"
                      : "bg-white hover:bg-slate-50",
                  )}
                >
                  <td
                    className={cn(
                      `${TABLE_CELL_CLASS} font-medium`,
                      isBatchAssigned ? "text-slate-500" : "text-[#102A56]",
                    )}
                  >
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
                  <td className={TABLE_CELL_CLASS}>
                    <CourseStatusBadge
                      status={course.status}
                      deletedAt={course.deletedAt}
                      isDeleted={course.isDeleted}
                    />
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    <div className="flex items-center justify-end">
                      {isBatchAssigned ? (
                        <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          {ALREADY_ASSIGNED_LABEL}
                        </span>
                      ) : canUnassign ? (
                        <BranchIconAction
                          icon={Link2Off}
                          label="Unassign"
                          destructive
                          disabled={
                            assignmentsDisabled ||
                            unassignLoading ||
                            assignSubmitting
                          }
                          onClick={() => setUnassignTarget(course)}
                        />
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </BranchManageTableShell>

          {!isLoading && total > 0 ? (
            <div className={BRANCH_PAGINATION_FOOTER_CLASS}>
              <p className="text-xs text-[#647A9B]">
                Showing {from}–{to} of {total}
              </p>
              <CategoryPagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </div>
      </div>

      <AssignBranchCourseModal
        open={assignOpen}
        branchId={branchId}
        courses={availableCourses}
        assignedCourseIds={modalAssignedCourseIds}
        isLoading={assignModalLoading}
        isSubmitting={assignSubmitting}
        onClose={closeAssignModal}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign course?"
        description={`Remove "${unassignTarget?.title ?? "this course"}" from this branch? Batch assignments will not be changed.`}
        confirmLabel="Unassign"
        loading={unassignLoading}
        onCancel={() => {
          if (!unassignLoading) {
            setUnassignTarget(null);
          }
        }}
        onConfirm={() => {
          void handleUnassign();
        }}
      />
    </>
  );
}
