"use client";



import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";



import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { CategoryPagination } from "@/src/features/categories/components/category-pagination";

import { Card } from "@/src/shared/components/ui/card";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { appToast } from "@/src/shared/components/ui/toast";



import { useCategories } from "@/src/features/categories/hooks/use-categories";

import { useCategoryActions } from "@/src/features/categories/hooks/use-category-actions";

import { useBulkUpdateStatus } from "@/src/features/categories/hooks/use-bulk-update-status";

import { useBulkDeleteCategories } from "@/src/features/categories/hooks/use-bulk-delete-categories";

import { useBulkRestoreCategories } from "@/src/features/categories/hooks/use-bulk-restore-categories";

import { useBulkPermanentDeleteCategories } from "@/src/features/categories/hooks/use-bulk-permanent-delete-categories";



import { CategoryTable } from "@/src/features/categories/components/category-table";

import { CategorySummaryHeader } from "@/src/features/categories/components/category-summary-header";

const CreateCategoryModal = dynamic(
  () =>
    import("@/src/features/categories/components/create-category-modal").then(
      (mod) => ({ default: mod.CreateCategoryModal }),
    ),
  { ssr: false },
);

const EditCategoryModal = dynamic(
  () =>
    import("@/src/features/categories/components/edit-category-modal").then(
      (mod) => ({ default: mod.EditCategoryModal }),
    ),
  { ssr: false },
);

const StatusCategoryDialog = dynamic(
  () =>
    import("@/src/features/categories/components/status-category-dialog").then(
      (mod) => ({ default: mod.StatusCategoryDialog }),
    ),
  { ssr: false },
);

const ArchiveCategoryDialog = dynamic(
  () =>
    import("@/src/features/categories/components/archive-category-dialog").then(
      (mod) => ({ default: mod.ArchiveCategoryDialog }),
    ),
  { ssr: false },
);

const RestoreCategoryDialog = dynamic(
  () =>
    import("@/src/features/categories/components/restore-category-dialog").then(
      (mod) => ({ default: mod.RestoreCategoryDialog }),
    ),
  { ssr: false },
);

const PermanentDeleteCategoryDialog = dynamic(
  () =>
    import(
      "@/src/features/categories/components/permanent-delete-category-dialog"
    ).then((mod) => ({ default: mod.PermanentDeleteCategoryDialog })),
  { ssr: false },
);

import {

  CategoryBulkActionsToolbar,

  type BulkCategoryAction,

} from "@/src/features/categories/components/category-bulk-actions-toolbar";



import { categoryService } from "@/src/features/categories/services/category.service";



import type { CategoryListItem } from "@/src/features/categories/types/category.types";

import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {

  formatBulkResultToast,

  getEligibleActivateIds,

  getEligibleDeactivateIds,

  getEligibleDeleteIds,

  getEligiblePermanentDeleteIds,

  getEligibleRestoreIds,

} from "@/src/features/categories/utils/category-bulk.utils";

import {
  buildArchiveDescription,
  buildBulkArchiveBlockedDescription,
  buildBulkArchiveConfirmDescription,
  buildBulkDeactivateBlockedDescription,
  buildBulkDeactivateConfirmDescription,
  buildDeactivateDescription,
  buildPermanentDeleteDescription,
  collectBulkCourseBlocks,
  isCategoryArchiveAllowed,
  isCategoryDeactivateAllowed,
  parseCategoryDependencySummary,
  type CategoryDependencySummary,
} from "@/src/features/categories/utils/category-dependency-copy.utils";
import { AxiosError } from "axios";



type DialogAction =
  | "activate"
  | "deactivate"
  | "archive"
  | "restore"
  | "permanent-delete"
  | null;



function buildActivateDescription(name: string): string {
  return `${name} will become active and visible in active category lists again.\n\nDo you want to continue?`;
}

export function CategoriesPage() {

  const searchParams = useSearchParams();

  const openedCategoryFromQueryRef = useRef<string | null>(null);

  const {

    categories,

    total,

    catalogTotal,

    isInitialLoading,

    isFetching,

    error,

    filters,

    setFilters,

    refetch,

  } = useCategories();



  const {

    activateCategory,

    deactivateCategory,

    deleteCategory,

    restoreCategory,

    permanentlyDeleteCategory,

    isLoading: actionLoading,

  } = useCategoryActions();



  const { bulkUpdateStatus, isPending: isBulkUpdatingStatus } =

    useBulkUpdateStatus();

  const { bulkDeleteCategories, isPending: isBulkDeleting } =

    useBulkDeleteCategories();

  const { bulkRestoreCategories, isPending: isBulkRestoring } =

    useBulkRestoreCategories();

  const {

    bulkPermanentDeleteCategories,

    isPending: isBulkPermanentDeleting,

  } = useBulkPermanentDeleteCategories();



  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [bulkConfirmAction, setBulkConfirmAction] =

    useState<BulkCategoryAction | null>(null);

  const [bulkBlockedDescription, setBulkBlockedDescription] = useState<
    string | null
  >(null);

  const [pendingBulkLifecycleCheck, setPendingBulkLifecycleCheck] = useState<
    "deactivate" | "archive" | null
  >(null);

  const bulkCheckRequestIdRef = useRef(0);



  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] =

    useState<CategoryListItem | null>(null);



  const [dialogAction, setDialogAction] = useState<DialogAction>(null);

  const [dependencySummary, setDependencySummary] =

    useState<CategoryDependencySummary | null>(null);

  const [pendingLifecycleCheck, setPendingLifecycleCheck] = useState<{
    categoryId: string;
    action: "deactivate" | "archive";
  } | null>(null);

  const lifecycleCheckRequestIdRef = useRef(0);

  const [isReordering, setIsReordering] = useState(false);



  const bulkActionLoading =

    isBulkUpdatingStatus ||

    isBulkDeleting ||

    isBulkRestoring ||

    isBulkPermanentDeleting;



  const tableActionLoading =

    actionLoading ||
    isReordering ||
    bulkActionLoading;



  const eligibleBulkIds = useMemo(() => {

    if (!bulkConfirmAction) {

      return [];

    }



    switch (bulkConfirmAction) {

      case "activate":

        return getEligibleActivateIds(categories, selectedCategoryIds);

      case "deactivate":

        return getEligibleDeactivateIds(categories, selectedCategoryIds);

      case "delete":

        return getEligibleDeleteIds(categories, selectedCategoryIds);

      case "restore":

        return getEligibleRestoreIds(categories, selectedCategoryIds);

      case "permanent-delete":

        return getEligiblePermanentDeleteIds(categories, selectedCategoryIds);

      default:

        return [];

    }

  }, [bulkConfirmAction, categories, selectedCategoryIds]);



  useEffect(() => {

    setSelectedCategoryIds([]);

  }, [filters.page, filters.pageSize, filters.status, filters.search]);



  useEffect(() => {

    const categoryId = searchParams.get("categoryId")?.trim();

    if (!categoryId || openedCategoryFromQueryRef.current === categoryId) {

      return;

    }

    openedCategoryFromQueryRef.current = categoryId;

    const fromList = categories.find((category) => category.id === categoryId);

    if (fromList) {

      setSelectedCategory(fromList);

      setEditOpen(true);

      return;

    }

    let cancelled = false;

    void categoryService

      .getCategory(categoryId)

      .then((response) => {

        if (cancelled) {

          return;

        }

        const category = response.data;

        setSelectedCategory({

          id: category.id,

          name: category.name,

          slug: category.slug,

          description: category.description,

          status: category.status,

          displayOrder: category.displayOrder,

          isDeleted: category.isDeleted,

          createdAt: category.createdAt,

          updatedAt: category.updatedAt,

          thumbnailUrl: category.thumbnailUrl,

        });

        setEditOpen(true);

      })

      .catch(() => {

        openedCategoryFromQueryRef.current = null;

      });

    return () => {

      cancelled = true;

    };

  }, [searchParams, categories]);



  useEffect(() => {

    const maxPage = Math.max(1, Math.ceil(total / filters.pageSize));



    if (filters.page > maxPage) {

      setFilters({

        ...filters,

        page: maxPage,

      });

    }

  }, [total, filters, setFilters]);



  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));



  const handleEdit = (category: CategoryListItem) => {

    setSelectedCategory(category);

    setEditOpen(true);

  };



  const loadDependencySummaryById = async (categoryId: string) => {
    const response =
      await categoryService.getCategoryDependencies(categoryId);

    return parseCategoryDependencySummary(response.data);
  };

  const loadDependencies = async (category: CategoryListItem) =>
    loadDependencySummaryById(category.id);



  const startLifecycleDependencyCheck = async (

    category: CategoryListItem,

    action: "deactivate" | "archive",

  ) => {

    const requestId = ++lifecycleCheckRequestIdRef.current;

    setPendingLifecycleCheck({ categoryId: category.id, action });

    try {

      const summary = await loadDependencies(category);

      if (requestId !== lifecycleCheckRequestIdRef.current) {

        return;

      }

      setSelectedCategory(category);

      setDependencySummary(summary);

      setDialogAction(action);

    } catch (error) {

      if (requestId !== lifecycleCheckRequestIdRef.current) {

        return;

      }

      appToast.error(

        getErrorMessage(error) ||

          "Unable to verify category assignments. Please try again.",

      );

    } finally {

      if (requestId === lifecycleCheckRequestIdRef.current) {

        setPendingLifecycleCheck(null);

      }

    }

  };



  const openActivateDialog = (category: CategoryListItem) => {
    lifecycleCheckRequestIdRef.current += 1;
    setPendingLifecycleCheck(null);
    setSelectedCategory(category);
    setDependencySummary(null);
    setDialogAction("activate");
  };

  const openRestoreDialog = (category: CategoryListItem) => {

    setSelectedCategory(category);

    setDialogAction("restore");

  };

  const openPermanentDeleteDialog = (category: CategoryListItem) => {
    lifecycleCheckRequestIdRef.current += 1;
    setPendingLifecycleCheck(null);
    setSelectedCategory(category);
    setDependencySummary(null);
    setDialogAction("permanent-delete");
  };



  const closeDialog = () => {

    lifecycleCheckRequestIdRef.current += 1;

    setPendingLifecycleCheck(null);

    setDialogAction(null);

    setSelectedCategory(null);

    setDependencySummary(null);

  };



  const handleConfirmDialog = async () => {

    const action = dialogAction;

    const category = selectedCategory;



    if (!category || !action) {

      return;

    }



    try {

      switch (action) {
        case "activate":
          await activateCategory(category.id);
          break;

        case "deactivate":

          if (!isCategoryDeactivateAllowed(dependencySummary, false)) {
            return;
          }

          await deactivateCategory(category.id);

          break;

        case "archive":

          if (!isCategoryArchiveAllowed(dependencySummary, false)) {
            return;
          }

          await deleteCategory(category.id);

          break;

        case "restore":

          await restoreCategory(category.id);

          break;

        case "permanent-delete":

          await permanentlyDeleteCategory(category.id);

          break;

      }



      closeDialog();

      await refetch();

    } catch (error) {

      if (
        category &&
        (action === "deactivate" || action === "archive") &&
        error instanceof AxiosError &&
        error.response?.status === 409
      ) {
        try {
          const summary = await loadDependencies(category);
          setDependencySummary(summary);
        } catch {
          // Toast already shown by action hook.
        }
        return;
      }

      // Toast handled in hook

    }

  };



  const handleActivate = openActivateDialog;

  const closeBulkDialog = () => {
    bulkCheckRequestIdRef.current += 1;
    setPendingBulkLifecycleCheck(null);
    setBulkConfirmAction(null);
    setBulkBlockedDescription(null);
  };

  const handleBulkToolbarAction = (action: BulkCategoryAction) => {
    if (pendingBulkLifecycleCheck) {
      return;
    }

    if (action === "deactivate" || action === "delete") {
      const eligibleIds =
        action === "deactivate"
          ? getEligibleDeactivateIds(categories, selectedCategoryIds)
          : getEligibleDeleteIds(categories, selectedCategoryIds);

      if (eligibleIds.length === 0) {
        return;
      }

      const requestId = ++bulkCheckRequestIdRef.current;
      setPendingBulkLifecycleCheck(
        action === "deactivate" ? "deactivate" : "archive",
      );

      void (async () => {
        try {
          const blocks = await collectBulkCourseBlocks(
            categories,
            eligibleIds,
            loadDependencySummaryById,
            action === "deactivate" ? "deactivate" : "archive",
          );

          if (requestId !== bulkCheckRequestIdRef.current) {
            return;
          }

          if (blocks.length > 0) {
            setBulkBlockedDescription(
              action === "deactivate"
                ? buildBulkDeactivateBlockedDescription(blocks)
                : buildBulkArchiveBlockedDescription(blocks),
            );
          } else {
            setBulkBlockedDescription(null);
          }

          setBulkConfirmAction(action);
        } catch (error) {
          if (requestId !== bulkCheckRequestIdRef.current) {
            return;
          }

          appToast.error(
            getErrorMessage(error) ||
              "Unable to verify category assignments. Please try again.",
          );
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

  const handleReorder = async (payload: {

    categoryId: string;

    newDisplayOrder: number;

  }) => {

    try {

      setIsReordering(true);

      await categoryService.reorderCategories(payload);

      appToast.success("Category order updated");

      await refetch();

    } catch (error) {

      appToast.error(getErrorMessage(error));

      throw error;

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

        result = await bulkUpdateStatus(eligibleBulkIds, "ACTIVE");

        if (result) {

          appToast.success(

            formatBulkResultToast(result, "categor(ies) activated successfully"),

          );

        }

        break;

      case "deactivate":

        result = await bulkUpdateStatus(eligibleBulkIds, "INACTIVE");

        if (result) {

          appToast.success(

            formatBulkResultToast(

              result,

              "categor(ies) deactivated successfully",

            ),

          );

        }

        break;

      case "delete":

        result = await bulkDeleteCategories(eligibleBulkIds);

        if (result) {

          appToast.success(

            formatBulkResultToast(result, "categor(ies) archived successfully"),

          );

        }

        break;

      case "restore":

        result = await bulkRestoreCategories(eligibleBulkIds);

        if (result) {

          appToast.success(

            formatBulkResultToast(result, "categor(ies) restored successfully"),

          );

        }

        break;

      case "permanent-delete":

        result = await bulkPermanentDeleteCategories(eligibleBulkIds);

        if (result) {

          appToast.success(

            formatBulkResultToast(result, "categor(ies) permanently deleted"),

          );

        }

        break;

    }



    if (result) {

      setSelectedCategoryIds([]);

      closeBulkDialog();

      await refetch();

    }

  };



  const bulkDialogCopy = useMemo(() => {

    const count = eligibleBulkIds.length;



    switch (bulkConfirmAction) {

      case "activate":

        return {

          title: "Activate selected categories?",

          description: `Activate ${count} selected categor${count === 1 ? "y" : "ies"}?`,

          confirmLabel: "Activate",

          confirmVariant: "success" as const,

        };

      case "deactivate":

        return {

          title: "Deactivate categories?",

          description: buildBulkDeactivateConfirmDescription(),

          confirmLabel: "Deactivate",

          confirmVariant: "danger" as const,

        };

      case "delete":

        return {

          title: "Archive categories?",

          description: buildBulkArchiveConfirmDescription(),

          confirmLabel: "Archive",

          confirmVariant: "danger" as const,

        };

      case "restore":

        return {

          title: "Restore selected categories?",

          description: `Restore ${count} archived categor${count === 1 ? "y" : "ies"}?`,

          confirmLabel: "Restore",

          confirmVariant: "primary" as const,

        };

      case "permanent-delete":

        return {

          title: "Permanently delete selected categories?",

          description: `You are about to permanently delete ${count} categor${count === 1 ? "y" : "ies"}. This action cannot be undone.`,

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



  if (error && categories.length === 0 && !isInitialLoading) {

    return (

      <ErrorState

        title="Failed To Load Categories"

        description={error}

        onRetry={() => {

          void refetch();

        }}

      />

    );

  }



  const from =

    total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;

  const to = Math.min(filters.page * filters.pageSize, total);



  const categoryName = selectedCategory?.name ?? "This category";



  return (

    <div className="space-y-3">

      <CategorySummaryHeader

        total={catalogTotal}

        isLoading={isInitialLoading}

        createDisabled={bulkActionLoading}

        onCreate={() => setCreateOpen(true)}

        search={filters.search ?? ""}

        onSearchChange={(value) =>

          setFilters({

            ...filters,

            search: value,

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

          <CategoryBulkActionsToolbar

            categories={categories}

            selectedCategoryIds={selectedCategoryIds}

            disabled={tableActionLoading || isFetching}

            pendingBulkLifecycleCheck={pendingBulkLifecycleCheck}

            onAction={handleBulkToolbarAction}

          />



          {isInitialLoading ? (

            <SkeletonTable rows={10} />

          ) : (

            <>

              {error && (

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

              )}



              <div aria-busy={isFetching} className="relative">

                {isFetching && (

                  <span className="sr-only">Updating categories</span>

                )}



                <CategoryTable

                  categories={categories}

                  selectedCategoryIds={selectedCategoryIds}

                  onSelectionChange={setSelectedCategoryIds}

                  actionsDisabled={tableActionLoading || isFetching}

                  selectionDisabled={tableActionLoading || isFetching}

                  reorderDisabled={

                    isReordering ||

                    !!filters.status ||

                    !!filters.search.trim() ||

                    isFetching ||

                    selectedCategoryIds.length > 0

                  }

                  onEdit={handleEdit}

                  onActivate={handleActivate}

                  pendingLifecycleCheck={pendingLifecycleCheck}

                  onDeactivate={(category) => {

                    void startLifecycleDependencyCheck(category, "deactivate");

                  }}

                  onDelete={(category) => {

                    void startLifecycleDependencyCheck(category, "archive");

                  }}

                  onRestore={openRestoreDialog}

                  onPermanentDelete={openPermanentDeleteDialog}

                  onReorder={handleReorder}

                />

              </div>



              <div className="flex flex-col gap-1.5 border-t border-[#D9E4F2] bg-gradient-to-r from-[#F8FBFF] via-[#F2F7FD] to-[#EAF2FB] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#647A9B] sm:text-sm">
                  <span>
                    Showing {from}–{to} of {total}
                  </span>

                  <label className="flex items-center gap-1.5">
                    <span className="whitespace-nowrap">Rows per page</span>
                    <select
                      className="h-7 rounded-md border border-[#DCE8F5] bg-white px-1.5 text-xs text-[#102A56] sm:text-sm"
                      value={filters.pageSize}
                      disabled={bulkActionLoading}
                      onChange={(event) =>
                        setFilters({
                          ...filters,
                          pageSize: Number(event.target.value),
                        })
                      }
                    >
                      {[10, 20, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <CategoryPagination
                  page={filters.page}
                  totalPages={totalPages}
                  onPageChange={(page) =>
                    setFilters({
                      ...filters,
                      page,
                    })
                  }
                />
              </div>

            </>

          )}

        </Card>

      {createOpen ? (
        <CreateCategoryModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onSuccess={() => {
            void refetch();
          }}
        />
      ) : null}

      {editOpen && selectedCategory ? (
        <EditCategoryModal
          open={editOpen}
          category={selectedCategory}
          onClose={() => {
            setEditOpen(false);
            setSelectedCategory(null);
          }}
          onSuccess={() => {
            void refetch();
          }}
        />
      ) : null}

      {dialogAction === "activate" ? (
      <StatusCategoryDialog
        open
        category={selectedCategory}
        mode="activate"
        isLoading={actionLoading}
        description={buildActivateDescription(categoryName)}
        canProceed
        onClose={closeDialog}
        onConfirm={handleConfirmDialog}
      />
      ) : null}

      {dialogAction === "deactivate" && dependencySummary ? (
      <StatusCategoryDialog
        open
        category={selectedCategory}
        mode="deactivate"
        isLoading={actionLoading}
        description={buildDeactivateDescription(dependencySummary, false)}
        canProceed={isCategoryDeactivateAllowed(dependencySummary, false)}
        onClose={closeDialog}
        onConfirm={handleConfirmDialog}
      />
      ) : null}

      {dialogAction === "archive" && dependencySummary ? (
      <ArchiveCategoryDialog

        open

        category={selectedCategory}

        isLoading={actionLoading}

        description={buildArchiveDescription(dependencySummary, false)}
        canProceed={isCategoryArchiveAllowed(dependencySummary, false)}

        onClose={closeDialog}

        onConfirm={handleConfirmDialog}

      />
      ) : null}

      {dialogAction === "restore" ? (
      <RestoreCategoryDialog

        open

        category={selectedCategory}

        isLoading={actionLoading}

        onClose={closeDialog}

        onConfirm={handleConfirmDialog}

      />
      ) : null}

      {dialogAction === "permanent-delete" ? (
      <PermanentDeleteCategoryDialog

        open

        category={selectedCategory}

        isLoading={actionLoading}

        description={buildPermanentDeleteDescription()}

        onClose={closeDialog}

        onConfirm={handleConfirmDialog}

      />
      ) : null}

      <ConfirmDialog

        open={bulkConfirmAction !== null}

        title={
          bulkBlockedDescription
            ? bulkConfirmAction === "delete"
              ? "Cannot archive selected categories"
              : "Cannot deactivate selected categories"
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

        onConfirm={() => {

          if (bulkBlockedDescription) {
            closeBulkDialog();
            return;
          }

          void handleBulkConfirm();

        }}

        onCancel={() => {

          if (!bulkActionLoading) {

            closeBulkDialog();

          }

        }}

      />

    </div>

  );

}

