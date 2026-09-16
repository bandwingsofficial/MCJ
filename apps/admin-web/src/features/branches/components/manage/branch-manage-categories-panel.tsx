"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Link2Off, Tag } from "lucide-react";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { CategoryPagination } from "@/src/features/categories/components/category-pagination";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";
import { cn } from "@/src/shared/lib/cn";

import { AssignBranchCategoryModal } from "@/src/features/branches/components/manage/assign-branch-category-modal";
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
  filterAssignedBranchCategories,
  getBranchAssignedCategoryIds,
  isCategoryAssignedViaBranchCourses,
  loadBranchAssignedCategories,
} from "@/src/features/branches/utils/branch-category-relation.utils";
import { branchService } from "@/src/features/branches/services/branch.service";
import { categoryService } from "@/src/features/categories/services/category.service";
import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import { CategoryStatusBadge } from "@/src/features/categories/components/category-status-badge";

const DEFAULT_CATEGORY_PAGE_SIZE = 20;
const ALREADY_ASSIGNED_LABEL = "ALREADY ASSIGNED";

interface Props {
  branchId: string;
  assignmentsDisabled?: boolean;
  assignOnMount?: boolean;
  onAssignOnMountHandled?: () => void;
  onSummaryRefresh?: () => Promise<void>;
}

export function BranchManageCategoriesPanel({
  branchId,
  assignmentsDisabled = false,
  assignOnMount = false,
  onAssignOnMountHandled,
  onSummaryRefresh,
}: Props) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [assignedCategories, setAssignedCategories] = useState<
    CategoryListItem[]
  >([]);
  const [courseAssignedCategoryIds, setCourseAssignedCategoryIds] = useState<
    Set<string>
  >(new Set());
  const [manualBranchCategoryIds, setManualBranchCategoryIds] = useState<
    Set<string>
  >(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [availableCategories, setAvailableCategories] = useState<
    CategoryListItem[]
  >([]);
  const [modalAssignedCategoryIds, setModalAssignedCategoryIds] = useState<
    string[]
  >([]);
  const [assignOpen, setAssignOpen] = useState(false);
  const [assignModalLoading, setAssignModalLoading] = useState(false);
  const [assignSubmitting, setAssignSubmitting] = useState(false);

  const [unassignTarget, setUnassignTarget] = useState<CategoryListItem | null>(
    null,
  );
  const [unassignLoading, setUnassignLoading] = useState(false);

  const pageSize = DEFAULT_CATEGORY_PAGE_SIZE;

  const filteredCategories = useMemo(
    () => filterAssignedBranchCategories(assignedCategories, search),
    [assignedCategories, search],
  );

  const total = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedCategories = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, page, pageSize]);

  const assignedCategoryIds = useMemo(
    () =>
      getBranchAssignedCategoryIds(
        courseAssignedCategoryIds,
        manualBranchCategoryIds,
      ),
    [courseAssignedCategoryIds, manualBranchCategoryIds],
  );

  const loadData = useCallback(async () => {
    if (!branchId) {
      setAssignedCategories([]);
      setCourseAssignedCategoryIds(new Set());
      setManualBranchCategoryIds(new Set());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const {
        categories,
        courseAssignedCategoryIds: courseCategoryIds,
        manualBranchCategoryIds: manualCategoryIds,
      } = await loadBranchAssignedCategories(branchId);

      setAssignedCategories(categories);
      setCourseAssignedCategoryIds(courseCategoryIds);
      setManualBranchCategoryIds(manualCategoryIds);
    } catch (loadError) {
      const message = getErrorMessage(loadError);
      setError(message);
      setAssignedCategories([]);
      setCourseAssignedCategoryIds(new Set());
      setManualBranchCategoryIds(new Set());
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

  const loadAvailableCategories = useCallback(async () => {
    setAssignModalLoading(true);
    try {
      const [
        {
          courseAssignedCategoryIds: courseIds,
          manualBranchCategoryIds: manualIds,
        },
        activeCategories,
      ] = await Promise.all([
        loadBranchAssignedCategories(branchId),
        categoryService.getActiveCategoriesForAssignment(),
      ]);

      setAvailableCategories(activeCategories);
      setModalAssignedCategoryIds(
        Array.from(getBranchAssignedCategoryIds(courseIds, manualIds)),
      );
    } catch (loadError) {
      appToast.error(getErrorMessage(loadError));
      setAssignOpen(false);
    } finally {
      setAssignModalLoading(false);
    }
  }, [branchId]);

  const openAssignModal = async () => {
    setModalAssignedCategoryIds(
      Array.from(
        getBranchAssignedCategoryIds(
          courseAssignedCategoryIds,
          manualBranchCategoryIds,
        ),
      ),
    );
    setAssignOpen(true);
    await loadAvailableCategories();
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

  const handleAssign = async (categoryIds: string[]) => {
    const uniqueCategoryIds = Array.from(new Set(categoryIds)).filter(
      (categoryId) => !assignedCategoryIds.has(categoryId),
    );

    if (uniqueCategoryIds.length === 0) {
      appToast.error(
        "Selected categories are already assigned to this branch.",
      );
      return;
    }

    setAssignSubmitting(true);
    try {
      await branchService.assignCategories(branchId, uniqueCategoryIds);
      appToast.success(
        uniqueCategoryIds.length === 1
          ? "Category assigned successfully"
          : `${uniqueCategoryIds.length} categories assigned successfully`,
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
      isCategoryAssignedViaBranchCourses(
        unassignTarget.id,
        courseAssignedCategoryIds,
      )
    ) {
      appToast.error(
        "This category is assigned through a course and cannot be unassigned here.",
      );
      setUnassignTarget(null);
      return;
    }

    if (!manualBranchCategoryIds.has(unassignTarget.id)) {
      appToast.error("This category is not manually assigned to this branch.");
      setUnassignTarget(null);
      return;
    }

    setUnassignLoading(true);
    try {
      await branchService.unassignCategory(branchId, unassignTarget.id);
      appToast.success("Category unassigned");
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

  if (error && assignedCategories.length === 0 && !isLoading) {
    return (
      <ErrorState
        title="Failed to load categories"
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
              <h2 className={BRANCH_TAB_TITLE_CLASS}>Categories</h2>
              <span className={BRANCH_TAB_COUNT_CLASS}>
                Total Categories:
                <span className="ml-1 font-semibold tabular-nums text-[#647A9B]">
                  {isLoading ? "—" : assignedCategories.length}
                </span>
              </span>
            </div>

            <BranchSectionToolbar
              search={search}
              onSearchChange={setSearch}
              searchPlaceholder="Search categories..."
              assignLabel="Assign Category"
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
            emptyTitle="No Categories Assigned Yet"
            emptyDescription="Assign categories to this branch to get started."
            emptyIcon={Tag}
          >
            {paginatedCategories.map((category) => {
              const isCourseAssigned = isCategoryAssignedViaBranchCourses(
                category.id,
                courseAssignedCategoryIds,
              );
              const canUnassign =
                manualBranchCategoryIds.has(category.id) && !isCourseAssigned;

              return (
                <tr
                  key={category.id}
                  className={cn(
                    "border-b border-slate-100 transition-colors",
                    isCourseAssigned
                      ? "cursor-not-allowed bg-slate-50/80 text-slate-500"
                      : "bg-white hover:bg-slate-50",
                  )}
                >
                  <td
                    className={cn(
                      `${TABLE_CELL_CLASS} font-medium`,
                      isCourseAssigned ? "text-slate-500" : "text-[#102A56]",
                    )}
                  >
                    <span className="block truncate" title={category.name}>
                      {category.name}
                    </span>
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    <CategoryStatusBadge status={category.status} />
                  </td>
                  <td className={TABLE_CELL_CLASS}>
                    <div className="flex items-center justify-end">
                      {isCourseAssigned ? (
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
                          onClick={() => setUnassignTarget(category)}
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

      <AssignBranchCategoryModal
        open={assignOpen}
        branchId={branchId}
        categories={availableCategories}
        assignedCategoryIds={modalAssignedCategoryIds}
        isLoading={assignModalLoading}
        isSubmitting={assignSubmitting}
        onClose={closeAssignModal}
        onAssign={handleAssign}
      />

      <ConfirmDialog
        open={Boolean(unassignTarget)}
        title="Unassign category?"
        description={`Remove "${unassignTarget?.name ?? "this category"}" from this branch? Course assignments will not be changed.`}
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
