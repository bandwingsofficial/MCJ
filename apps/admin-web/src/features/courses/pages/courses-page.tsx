"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { useCategories } from "@/src/features/categories/hooks/use-categories";

import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCourses } from "@/src/features/courses/hooks/use-courses";
import { useActivateCourse } from "@/src/features/courses/hooks/use-activate-course";
import { useDeactivateCourse } from "@/src/features/courses/hooks/use-deactivate-course";
import { useBulkActivateCourses } from "@/src/features/courses/hooks/use-bulk-activate-courses";
import { useBulkDeactivateCourses } from "@/src/features/courses/hooks/use-bulk-deactivate-courses";
import { useBulkDeleteCourses } from "@/src/features/courses/hooks/use-bulk-delete-courses";
import { useBulkRestoreCourses } from "@/src/features/courses/hooks/use-bulk-restore-courses";
import { useBulkPermanentDeleteCourses } from "@/src/features/courses/hooks/use-bulk-permanent-delete-courses";

import { courseService } from "@/src/features/courses/services/course.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { CourseTable } from "@/src/features/courses/components/course-table";
import { CourseSummaryHeader } from "@/src/features/courses/components/course-summary-header";
import { CourseFormModal } from "@/src/features/courses/components/course-form-modal";
import { CourseActivateDialog } from "@/src/features/courses/components/course-activate-dialog";
import { CourseDeactivateDialog } from "@/src/features/courses/components/course-deactivate-dialog";
import {
  CourseBulkActionsToolbar,
  type BulkCourseAction,
} from "@/src/features/courses/components/course-bulk-actions-toolbar";
import {
  formatBulkResultToast,
  getEligibleActivateIds,
  getEligibleDeactivateIds,
  getEligibleDeleteIds,
  getEligiblePermanentDeleteIds,
  getEligibleRestoreIds,
} from "@/src/features/courses/utils/course-bulk.utils";
import {
  buildBulkCourseDeactivateBlockedDescription,
  buildBulkCourseDeleteBlockedDescription,
  buildBulkCourseDeleteConfirmDescription,
  buildCourseDeactivateDescription,
  collectBulkCourseBatchBlocks,
  isCourseDeactivateAllowed,
  parseCourseDependencySummary,
  type CourseDependencySummary,
} from "@/src/features/courses/utils/course-dependency-copy.utils";

import type {
  CourseDetails,
  CourseListItem,
} from "@/src/features/courses/types/course.types";

export function CoursesPage() {
  const {
    courses,
    total,
    catalogTotal,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useCourses();

  const { categories } = useCategories();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<CourseDetails | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [statusTarget, setStatusTarget] = useState<{
    course: CourseListItem;
    action: "activate";
  } | null>(null);
  const [selectedCourseIds, setSelectedCourseIds] = useState<
    string[]
  >([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkCourseAction | null>(null);
  const [bulkBlockedDescription, setBulkBlockedDescription] = useState<
    string | null
  >(null);
  const [pendingBulkLifecycleCheck, setPendingBulkLifecycleCheck] = useState<
    "delete" | "deactivate" | null
  >(null);
  const bulkCheckRequestIdRef = useRef(0);
  const lifecycleCheckRequestIdRef = useRef(0);
  const [pendingLifecycleCheck, setPendingLifecycleCheck] = useState<{
    courseId: string;
    action: "deactivate";
  } | null>(null);
  const [lifecycleCourse, setLifecycleCourse] =
    useState<CourseListItem | null>(null);
  const [dependencySummary, setDependencySummary] =
    useState<CourseDependencySummary | null>(null);
  const [isReordering, setIsReordering] = useState(false);

  const {
    bulkActivate,
    isPending: isBulkActivating,
  } = useBulkActivateCourses();
  const {
    bulkDeactivate,
    isPending: isBulkDeactivating,
  } = useBulkDeactivateCourses();
  const {
    bulkDelete,
    isPending: isBulkDeleting,
  } = useBulkDeleteCourses();
  const {
    bulkRestore,
    isPending: isBulkRestoring,
  } = useBulkRestoreCourses();
  const {
    bulkPermanentDelete,
    isPending: isBulkPermanentDeleting,
  } = useBulkPermanentDeleteCourses();

  const { activateCourse, isLoading: isActivatingCourse } =
    useActivateCourse();
  const { deactivateCourse, isLoading: isDeactivatingCourse } =
    useDeactivateCourse();
  const pageSize = filters.pageSize ?? 20;
  const page = filters.page ?? 1;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  const categoryOptions = useMemo(
    () =>
      categories.map((category) => ({
        label: category.name,
        value: category.id,
      })),
    [categories]
  );

  const bulkActionLoading =
    isBulkActivating ||
    isBulkDeactivating ||
    isBulkDeleting ||
    isBulkRestoring ||
    isBulkPermanentDeleting;

  const tableActionLoading =
    isReordering ||
    bulkActionLoading ||
    isActivatingCourse ||
    isDeactivatingCourse ||
    isEditLoading;

  const loadCourseDependencySummary = async (courseId: string) => {
    const response = await courseService.getCourseDependencies(courseId);
    return parseCourseDependencySummary(response.data);
  };

  const closeLifecycleDialog = () => {
    lifecycleCheckRequestIdRef.current += 1;
    setPendingLifecycleCheck(null);
    setLifecycleCourse(null);
    setDependencySummary(null);
  };

  const closeBulkDialog = () => {
    bulkCheckRequestIdRef.current += 1;
    setPendingBulkLifecycleCheck(null);
    setBulkConfirmAction(null);
    setBulkBlockedDescription(null);
  };

  const startDeactivateDependencyCheck = async (course: CourseListItem) => {
    const requestId = ++lifecycleCheckRequestIdRef.current;
    setPendingLifecycleCheck({ courseId: course.id, action: "deactivate" });

    try {
      const summary = await loadCourseDependencySummary(course.id);

      if (requestId !== lifecycleCheckRequestIdRef.current) {
        return;
      }

      setLifecycleCourse(course);
      setDependencySummary(summary);
    } catch (error) {
      if (requestId !== lifecycleCheckRequestIdRef.current) {
        return;
      }

      appToast.error(getErrorMessage(error));
    } finally {
      if (requestId === lifecycleCheckRequestIdRef.current) {
        setPendingLifecycleCheck(null);
      }
    }
  };

  const handleBulkToolbarAction = (action: BulkCourseAction) => {
    if (pendingBulkLifecycleCheck) {
      return;
    }

    if (action === "delete" || action === "deactivate") {
      const eligibleIds =
        action === "deactivate"
          ? getEligibleDeactivateIds(courses, selectedCourseIds)
          : getEligibleDeleteIds(courses, selectedCourseIds);

      if (eligibleIds.length === 0) {
        return;
      }

      const requestId = ++bulkCheckRequestIdRef.current;
      setPendingBulkLifecycleCheck(action);

      void (async () => {
        try {
          const blocks = await collectBulkCourseBatchBlocks(
            courses,
            eligibleIds,
            loadCourseDependencySummary,
            action,
          );

          if (requestId !== bulkCheckRequestIdRef.current) {
            return;
          }

          setBulkBlockedDescription(
            blocks.length > 0
              ? action === "deactivate"
                ? buildBulkCourseDeactivateBlockedDescription(blocks)
                : buildBulkCourseDeleteBlockedDescription(blocks)
              : null,
          );
          setBulkConfirmAction(action);
        } catch (error) {
          if (requestId !== bulkCheckRequestIdRef.current) {
            return;
          }

          appToast.error(getErrorMessage(error));
        } finally {
          if (requestId === bulkCheckRequestIdRef.current) {
            setPendingBulkLifecycleCheck(null);
          }
        }
      })();

      return;
    }

    setBulkBlockedDescription(null);
    setBulkConfirmAction(action);
  };

  const eligibleBulkIds = useMemo(() => {
    if (!bulkConfirmAction) {
      return [];
    }

    switch (bulkConfirmAction) {
      case "activate":
        return getEligibleActivateIds(courses, selectedCourseIds);
      case "deactivate":
        return getEligibleDeactivateIds(
          courses,
          selectedCourseIds
        );
      case "delete":
        return getEligibleDeleteIds(courses, selectedCourseIds);
      case "restore":
        return getEligibleRestoreIds(courses, selectedCourseIds);
      case "permanent-delete":
        return getEligiblePermanentDeleteIds(
          courses,
          selectedCourseIds
        );
      default:
        return [];
    }
  }, [bulkConfirmAction, courses, selectedCourseIds]);

  useEffect(() => {
    setSelectedCourseIds([]);
  }, [
    filters.page,
    filters.pageSize,
    filters.status,
    filters.categoryId,
    filters.search,
  ]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(total / pageSize));

    if (page > maxPage) {
      setFilters({
        ...filters,
        page: maxPage,
      });
    }
  }, [total, page, pageSize, filters, setFilters]);

  const handleActivate = (course: CourseListItem) => {
    setStatusTarget({ course, action: "activate" });
  };

  const handleDeactivate = (course: CourseListItem) => {
    void startDeactivateDependencyCheck(course);
  };

  const handleEdit = async (course: CourseListItem) => {
    try {
      setIsEditLoading(true);
      const response = await courseService.getCourse(course.id);
      setEditCourse(response.data);
    } catch (err) {
      appToast.error(getErrorMessage(err));
    } finally {
      setIsEditLoading(false);
    }
  };

  const handleActivateConfirm = async () => {
    if (!statusTarget) {
      return;
    }

    try {
      await activateCourse(statusTarget.course.id);
      appToast.success("Course activated successfully");
      setStatusTarget(null);
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
    }
  };

  const handleReorder = async (payload: {
    courseId: string;
    newDisplayOrder: number;
  }) => {
    try {
      setIsReordering(true);
      await courseService.reorderCourses(payload);
      appToast.success("Course order updated");
      await refetch();
    } catch (err) {
      appToast.error(getErrorMessage(err));
      throw err;
    } finally {
      setIsReordering(false);
    }
  };

  const handleBulkConfirm = async () => {
    if (!bulkConfirmAction || eligibleBulkIds.length === 0) {
      closeBulkDialog();
      return;
    }

    if (bulkBlockedDescription) {
      return;
    }

    let result = null;

    switch (bulkConfirmAction) {
      case "activate":
        result = await bulkActivate(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "course(s) activated successfully"
            )
          );
        }
        break;
      case "deactivate":
        result = await bulkDeactivate(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "course(s) deactivated successfully"
            )
          );
        }
        break;
      case "delete":
        result = await bulkDelete(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "course(s) archived successfully"
            )
          );
        }
        break;
      case "restore":
        result = await bulkRestore(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "course(s) restored successfully"
            )
          );
        }
        break;
      case "permanent-delete":
        result = await bulkPermanentDelete(eligibleBulkIds);
        if (result) {
          appToast.success(
            formatBulkResultToast(
              result,
              "course(s) permanently deleted"
            )
          );
        }
        break;
    }

    if (result) {
      setSelectedCourseIds([]);
      closeBulkDialog();
      await refetch();
    }
  };

  const bulkDialogCopy = useMemo(() => {
    const count = eligibleBulkIds.length;

    switch (bulkConfirmAction) {
      case "activate":
        return {
          title: "Activate selected courses?",
          description: `Activate ${count} selected course${count === 1 ? "" : "s"}?`,
          confirmLabel: "Activate",
          confirmVariant: "primary" as const,
        };
      case "deactivate":
        return {
          title: "Deactivate selected courses?",
          description: `Deactivate ${count} selected course${count === 1 ? "" : "s"}? They will be removed from active ordering.`,
          confirmLabel: "Deactivate",
          confirmVariant: "danger" as const,
        };
      case "delete":
        return {
          title: "Archive courses?",
          description: buildBulkCourseDeleteConfirmDescription(),
          confirmLabel: "Archive",
          confirmVariant: "danger" as const,
        };
      case "restore":
        return {
          title: "Restore selected courses?",
          description: `Restore ${count} archived course${count === 1 ? "" : "s"}?`,
          confirmLabel: "Restore",
          confirmVariant: "primary" as const,
        };
      case "permanent-delete":
        return {
          title: "Permanently delete selected courses?",
          description: `You are about to permanently delete ${count} course${count === 1 ? "" : "s"}. This action cannot be undone.`,
          confirmLabel: "Permanently Delete",
          confirmVariant: "danger" as const,
        };
      default:
        return {
          title: "",
          description: "",
          confirmLabel: "Confirm",
          confirmVariant: "primary" as const,
        };
    }
  }, [bulkConfirmAction, eligibleBulkIds.length]);

  if (error && courses.length === 0 && !isInitialLoading) {
    return (
      <ErrorState
        title="Failed To Load Courses"
        description={error}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  return (
    <div className="space-y-3">
      <CourseSummaryHeader
        total={catalogTotal}
        isLoading={isInitialLoading && courses.length === 0}
        onCreate={() => setIsCreateOpen(true)}
        createDisabled={bulkActionLoading}
        search={filters.search ?? ""}
        onSearchChange={(value) =>
          setFilters({
            ...filters,
            search: value,
          })
        }
        categoryId={filters.categoryId}
        categoryOptions={categoryOptions}
        onCategoryChange={(categoryId) =>
          setFilters({
            ...filters,
            categoryId,
          })
        }
        status={filters.status}
        onStatusChange={(status) =>
          setFilters({
            ...filters,
            status,
          })
        }
      />

      <Card className="overflow-hidden rounded-xl border-[#E1EBF5] p-0 shadow-sm">
          <CourseBulkActionsToolbar
            courses={courses}
            selectedCourseIds={selectedCourseIds}
            disabled={tableActionLoading || isFetching}
            pendingBulkLifecycleCheck={pendingBulkLifecycleCheck}
            onAction={handleBulkToolbarAction}
          />

          {isInitialLoading ? (
            <SkeletonTable rows={10} />
          ) : (
            <>
              {error ? (
                <div className="border-b border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
                  {error}{" "}
                  <button
                    type="button"
                    className="font-medium underline"
                    onClick={() => {
                      void refetch();
                    }}
                  >
                    Retry
                  </button>
                </div>
              ) : null}

              <div aria-busy={isFetching} className="relative">
                {isFetching ? (
                  <span className="sr-only">
                    Updating courses
                  </span>
                ) : null}

                <CourseTable
                  courses={courses}
                  selectedCourseIds={selectedCourseIds}
                  onSelectionChange={setSelectedCourseIds}
                  actionsDisabled={tableActionLoading || isFetching}
                  selectionDisabled={tableActionLoading || isFetching}
                  pendingLifecycleCheck={pendingLifecycleCheck}
                  reorderDisabled={
                    isReordering ||
                    !!filters.status ||
                    !!(filters.search ?? "").trim() ||
                    !!filters.categoryId ||
                    isFetching ||
                    selectedCourseIds.length > 0
                  }
                  onReorder={handleReorder}
                  onActivate={handleActivate}
                  onDeactivate={handleDeactivate}
                  onEdit={handleEdit}
                />
              </div>

              <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
                  <span>
                    Showing {from}–{to} of {total}
                  </span>

                  <label className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap">
                      Rows per page
                    </span>
                    <select
                      className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                      value={pageSize}
                      disabled={bulkActionLoading}
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          pageSize: Number(
                            event.target.value
                          ),
                        })
                      }
                    >
                      {[10, 20, 50].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <CategoryPagination
                  page={page}
                  totalPages={totalPages}
                  onPageChange={(nextPage) =>
                    setFilters({
                      ...filters,
                      page: nextPage,
                    })
                  }
                />
              </div>
            </>
          )}
        </Card>

      <CourseFormModal
        open={isCreateOpen}
        categoryOptions={categoryOptions}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async () => {
          await refetch();
        }}
      />

      <CourseFormModal
        open={editCourse !== null}
        course={editCourse}
        categoryOptions={categoryOptions}
        onClose={() => setEditCourse(null)}
        onSuccess={async () => {
          await refetch();
          setEditCourse(null);
        }}
      />

      <CourseActivateDialog
        open={statusTarget?.action === "activate"}
        isLoading={isActivatingCourse}
        onClose={() => {
          if (!isActivatingCourse) {
            setStatusTarget(null);
          }
        }}
        onConfirm={() => {
          void handleActivateConfirm();
        }}
      />

      {dependencySummary && lifecycleCourse ? (
        <CourseDeactivateDialog
          open
          isLoading={isDeactivatingCourse}
          canDeactivate={isCourseDeactivateAllowed(dependencySummary)}
          description={buildCourseDeactivateDescription(dependencySummary)}
          onClose={closeLifecycleDialog}
          onConfirm={() => {
            if (
              !lifecycleCourse ||
              !isCourseDeactivateAllowed(dependencySummary)
            ) {
              return;
            }

            void (async () => {
              try {
                await deactivateCourse(lifecycleCourse.id);
                appToast.success("Course deactivated successfully");
                closeLifecycleDialog();
                await refetch();
              } catch {
                try {
                  const summary = await loadCourseDependencySummary(
                    lifecycleCourse.id,
                  );
                  setDependencySummary(summary);
                } catch {
                  // Toast handled in hook.
                }
              }
            })();
          }}
        />
      ) : null}

      <ConfirmDialog
        open={bulkConfirmAction !== null}
        title={
          bulkBlockedDescription
            ? bulkConfirmAction === "deactivate"
              ? "Cannot deactivate selected courses"
              : "Cannot delete selected courses"
            : bulkDialogCopy.title
        }
        description={
          bulkBlockedDescription ?? bulkDialogCopy.description
        }
        confirmLabel={
          bulkBlockedDescription ? "OK" : bulkDialogCopy.confirmLabel
        }
        confirmVariant={
          bulkBlockedDescription
            ? "primary"
            : bulkDialogCopy.confirmVariant
        }
        loading={bulkActionLoading && !bulkBlockedDescription}
        showCancel={!bulkBlockedDescription}
        onCancel={() => {
          if (!bulkActionLoading) {
            closeBulkDialog();
          }
        }}
        onConfirm={() => {
          if (bulkBlockedDescription) {
            closeBulkDialog();
            return;
          }

          void handleBulkConfirm();
        }}
      />
    </div>
  );
}
