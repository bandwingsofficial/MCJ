"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useCategories } from "@/src/features/categories/hooks/use-categories";

import { Button } from "@/src/shared/components/ui/button";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { Card } from "@/src/shared/components/ui/card";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCourses } from "@/src/features/courses/hooks/use-courses";
import { useBulkActivateCourses } from "@/src/features/courses/hooks/use-bulk-activate-courses";
import { useBulkDeactivateCourses } from "@/src/features/courses/hooks/use-bulk-deactivate-courses";
import { useBulkDeleteCourses } from "@/src/features/courses/hooks/use-bulk-delete-courses";
import { useBulkRestoreCourses } from "@/src/features/courses/hooks/use-bulk-restore-courses";
import { useBulkPermanentDeleteCourses } from "@/src/features/courses/hooks/use-bulk-permanent-delete-courses";

import { courseService } from "@/src/features/courses/services/course.service";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { CourseFilters } from "@/src/features/courses/components/course-filters";
import { CourseTable } from "@/src/features/courses/components/course-table";
import { CourseFormModal } from "@/src/features/courses/components/course-form-modal";
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

export function CoursesPage() {
  const router = useRouter();

  const {
    courses,
    total,
    filters,
    setFilters,
    isInitialLoading,
    isFetching,
    error,
    refetch,
  } = useCourses();

  const { categories } = useCategories();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedCourseIds, setSelectedCourseIds] = useState<
    string[]
  >([]);
  const [bulkConfirmAction, setBulkConfirmAction] =
    useState<BulkCourseAction | null>(null);
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

  const hasActiveFilters = Boolean(
    (filters.search ?? "").trim() ||
      filters.categoryId ||
      filters.level ||
      filters.status
  );

  const bulkActionLoading =
    isBulkActivating ||
    isBulkDeactivating ||
    isBulkDeleting ||
    isBulkRestoring ||
    isBulkPermanentDeleting;

  const actionLoading = isReordering || bulkActionLoading;

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
    filters.level,
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
      setBulkConfirmAction(null);
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
      setBulkConfirmAction(null);
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
          title: "Archive selected courses?",
          description: `Archive ${count} selected course${count === 1 ? "" : "s"}? They can be restored later.`,
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
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Courses
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage courses and learning content
          </p>
        </div>

        <Button
          onClick={() => setIsCreateOpen(true)}
          className="h-9 rounded-lg px-4"
          disabled={bulkActionLoading}
        >
          Create Course
        </Button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <CourseFilters
            filters={filters}
            categoryOptions={categoryOptions}
            onChange={setFilters}
          />
        </div>

        {isInitialLoading ? (
          <SkeletonTable rows={10} />
        ) : (
          <Card className="overflow-hidden p-0 shadow-sm">
            {error ? (
              <div className="border-b border-red-100 bg-red-50 px-3.5 py-2 text-sm text-red-700">
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

            <div className="px-3 pt-3">
              <CourseBulkActionsToolbar
                courses={courses}
                selectedCourseIds={selectedCourseIds}
                disabled={actionLoading || isFetching}
                onAction={setBulkConfirmAction}
              />
            </div>

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
                actionsDisabled={actionLoading || isFetching}
                selectionDisabled={actionLoading || isFetching}
                reorderDisabled={
                  isReordering ||
                  !!filters.status ||
                  !!(filters.search ?? "").trim() ||
                  !!filters.categoryId ||
                  !!filters.level ||
                  isFetching ||
                  selectedCourseIds.length > 0
                }
                emptyTitle={
                  hasActiveFilters
                    ? "No Courses Found"
                    : "No Courses Yet"
                }
                emptyDescription={
                  hasActiveFilters
                    ? "Try adjusting your search or filters."
                    : "Create your first course to get started."
                }
                onReorder={handleReorder}
              />
            </div>

            <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-slate-200 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              {total > 0 ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-slate-600">
                    <span className="leading-9">
                      Showing {from}–{to} of {total}
                    </span>

                    <label className="flex items-center gap-2 leading-9">
                      <span className="whitespace-nowrap">
                        Rows per page
                      </span>
                      <select
                        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-[15px]"
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

                  <Pagination
                    page={page}
                    totalPages={totalPages}
                    onPageChange={(nextPage) =>
                      setFilters({
                        ...filters,
                        page: nextPage,
                      })
                    }
                  />
                </>
              ) : (
                <p className="text-[15px] leading-9 text-slate-500">
                  No courses to paginate
                </p>
              )}
            </div>
          </Card>
        )}
      </div>

      <CourseFormModal
        open={isCreateOpen}
        categoryOptions={categoryOptions}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={async (createdCourseId) => {
          await refetch();
          if (createdCourseId) {
            router.push(`/courses/${createdCourseId}/manage`);
          }
        }}
      />

      <ConfirmDialog
        open={bulkConfirmAction !== null}
        title={bulkDialogCopy.title}
        description={bulkDialogCopy.description}
        confirmLabel={bulkDialogCopy.confirmLabel}
        confirmVariant={bulkDialogCopy.confirmVariant}
        loading={bulkActionLoading}
        onCancel={() => {
          if (!bulkActionLoading) {
            setBulkConfirmAction(null);
          }
        }}
        onConfirm={() => {
          void handleBulkConfirm();
        }}
      />
    </>
  );
}
