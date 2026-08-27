"use client";



import { useEffect, useMemo, useState } from "react";



import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";

import { ErrorState } from "@/src/shared/components/ui/error-state";

import { Pagination } from "@/src/shared/components/ui/pagination";

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

import { CreateCategoryModal } from "@/src/features/categories/components/create-category-modal";

import { EditCategoryModal } from "@/src/features/categories/components/edit-category-modal";

import { StatusCategoryDialog } from "@/src/features/categories/components/status-category-dialog";

import { ArchiveCategoryDialog } from "@/src/features/categories/components/archive-category-dialog";

import { RestoreCategoryDialog } from "@/src/features/categories/components/restore-category-dialog";

import { PermanentDeleteCategoryDialog } from "@/src/features/categories/components/permanent-delete-category-dialog";

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



type DialogAction =
  | "activate"
  | "deactivate"
  | "archive"
  | "restore"
  | "permanent-delete"
  | null;



type DependencySummary = {

  canDelete: boolean;

  removable: {

    branches: number;

    courses: number;

    enrollments: number;

    articles: number;

  };

  blocking: {

    branches: number;

    courses: number;

    enrollments: number;

    articles: number;

  };

};



function buildPermanentDeleteDescription(

  name: string,

  summary: DependencySummary | null,

  loading: boolean,

): string {

  if (loading) {

    return "Checking category dependencies...";

  }



  if (!summary) {

    return "Unable to verify category dependencies. Please try again.";

  }



  if (!summary.canDelete) {

    const lines: string[] = [];



    if (summary.blocking.courses > 0) {

      lines.push(`Courses        ${summary.blocking.courses}`);

    }



    if (summary.blocking.enrollments > 0) {

      lines.push(`Enrollments    ${summary.blocking.enrollments}`);

    }



    if (summary.blocking.articles > 0) {

      lines.push(`Articles       ${summary.blocking.articles}`);

    }



    return `${name} is referenced by required records:\n\n${lines.join("\n")}\n\nThese must be reassigned to another category before this category can be deleted.`;

  }



  const removableLines: string[] = [];



  if (summary.removable.branches > 0) {

    removableLines.push(`Branches       ${summary.removable.branches}`);

  }



  if (summary.removable.courses > 0) {

    removableLines.push(`Courses        ${summary.removable.courses}`);

  }



  if (summary.removable.enrollments > 0) {

    removableLines.push(`Enrollments    ${summary.removable.enrollments}`);

  }



  if (summary.removable.articles > 0) {

    removableLines.push(`Articles       ${summary.removable.articles}`);

  }



  if (removableLines.length > 0) {

    const branchCount = summary.removable.branches;



    if (branchCount > 0) {

      return `${name} is assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}.\n\nPermanently deleting this category will remove its branch assignments.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?`;

    }



    return `${name} is currently used by:\n\n${removableLines.join("\n")}\n\nThese category assignments will be removed.\n\nThis action cannot be undone.\n\nAre you sure you want to continue?`;

  }



  return "This action cannot be undone.\n\nAre you sure you want to continue?";

}



function buildActivateDescription(name: string): string {
  return `${name} will become active and visible in active category lists again.\n\nDo you want to continue?`;
}

function buildDeactivateDescription(

  name: string,

  summary: DependencySummary | null,

  loading: boolean,

): string {

  if (loading) {

    return "Checking branch assignments before deactivation...";

  }



  const branchCount = summary?.removable.branches ?? 0;



  if (branchCount > 0) {

    return `${name} is currently assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}.\n\nDeactivating will remove it from those branch assignments and hide it from active category lists.\n\nDo you want to continue?`;

  }



  return `${name} will become inactive and hidden from active category lists.\n\nDo you want to continue?`;

}



function buildArchiveDescription(

  name: string,

  summary: DependencySummary | null,

): string {

  const branchCount = summary?.removable.branches ?? 0;



  if (branchCount > 0) {

    return `${name} is currently assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}.\n\nArchiving it will remove it from those branch assignments. This category will remain available for restoration.`;

  }



  return "This category will be archived and will remain available for restoration.";

}



export function CategoriesPage() {

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



  const [createOpen, setCreateOpen] = useState(false);

  const [editOpen, setEditOpen] = useState(false);

  const [selectedCategory, setSelectedCategory] =

    useState<CategoryListItem | null>(null);



  const [dialogAction, setDialogAction] = useState<DialogAction>(null);

  const [dependencySummary, setDependencySummary] =

    useState<DependencySummary | null>(null);

  const [dependencyLoading, setDependencyLoading] = useState(false);

  const [isReordering, setIsReordering] = useState(false);



  const bulkActionLoading =

    isBulkUpdatingStatus ||

    isBulkDeleting ||

    isBulkRestoring ||

    isBulkPermanentDeleting;



  const tableActionLoading =

    actionLoading || isReordering || bulkActionLoading;



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



  const loadDependencies = async (category: CategoryListItem) => {

    const response = await categoryService.getCategoryDependencies(category.id);



    return {

      canDelete: response.data.canDelete,

      removable: response.data.removable,

      blocking: response.data.blocking,

    };

  };



  const openDialogWithDependencies = async (

    category: CategoryListItem,

    action: Exclude<DialogAction, null>,

  ) => {

    setSelectedCategory(category);

    setDependencySummary(null);

    setDependencyLoading(true);

    setDialogAction(action);



    try {

      const summary = await loadDependencies(category);

      setDependencySummary(summary);

    } catch (error) {

      appToast.error(

        getErrorMessage(error) ||

          "Unable to verify category assignments. Please try again.",

      );

      setDialogAction(null);

      setSelectedCategory(null);

      setDependencySummary(null);

    } finally {

      setDependencyLoading(false);

    }

  };



  const openActivateDialog = (category: CategoryListItem) => {
    setSelectedCategory(category);
    setDependencySummary(null);
    setDependencyLoading(false);
    setDialogAction("activate");
  };

  const openRestoreDialog = (category: CategoryListItem) => {

    setSelectedCategory(category);

    setDialogAction("restore");

  };



  const closeDialog = () => {

    setDialogAction(null);

    setSelectedCategory(null);

    setDependencySummary(null);

    setDependencyLoading(false);

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

          await deactivateCategory(category.id);

          break;

        case "archive":

          await deleteCategory(category.id);

          break;

        case "restore":

          await restoreCategory(category.id);

          break;

        case "permanent-delete":

          if (dependencySummary && !dependencySummary.canDelete) {

            return;

          }

          await permanentlyDeleteCategory(category.id);

          break;

      }



      closeDialog();

      await refetch();

    } catch {

      // Toast handled in hook

    }

  };



  const handleActivate = openActivateDialog;

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

      setBulkConfirmAction(null);

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

      setBulkConfirmAction(null);

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

          title: "Deactivate selected categories?",

          description: `Deactivate ${count} selected categor${count === 1 ? "y" : "ies"}? They will be removed from branch assignments and active ordering.`,

          confirmLabel: "Deactivate",

          confirmVariant: "danger" as const,

        };

      case "delete":

        return {

          title: "Archive selected categories?",

          description: `Archive ${count} selected categor${count === 1 ? "y" : "ies"}? They can be restored later.`,

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

    <div className="-m-6 min-h-full bg-white p-6">

    <>

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



      <div className="mt-5">

        <Card className="overflow-hidden border-slate-200 p-0 shadow-sm">

          <CategoryBulkActionsToolbar

            categories={categories}

            selectedCategoryIds={selectedCategoryIds}

            disabled={tableActionLoading || isFetching}

            onAction={setBulkConfirmAction}

          />



          {isInitialLoading ? (

            <SkeletonTable rows={10} />

          ) : (

            <>

              {error && (

                <div className="border-b border-red-100 bg-red-50 px-4 py-2.5 text-sm text-red-700">

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

                  onDeactivate={(category) => {

                    void openDialogWithDependencies(category, "deactivate");

                  }}

                  onDelete={(category) => {

                    void openDialogWithDependencies(category, "archive");

                  }}

                  onRestore={openRestoreDialog}

                  onPermanentDelete={(category) => {

                    void openDialogWithDependencies(

                      category,

                      "permanent-delete",

                    );

                  }}

                  onReorder={handleReorder}

                />

              </div>



              <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-slate-200 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                {total > 0 ? (

                  <>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-slate-600">

                      <span className="leading-9">

                        Showing {from}–{to} of {total}

                      </span>



                      <label className="flex items-center gap-2 leading-9">

                        <span className="whitespace-nowrap">Rows per page</span>

                        <select

                          className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-[15px]"

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



                    <Pagination

                      page={filters.page}

                      totalPages={totalPages}

                      onPageChange={(page) =>

                        setFilters({

                          ...filters,

                          page,

                        })

                      }

                    />

                  </>

                ) : (

                  <p className="text-[15px] leading-9 text-slate-500">

                    No categories to paginate

                  </p>

                )}

              </div>

            </>

          )}

        </Card>

      </div>



      <CreateCategoryModal

        open={createOpen}

        onClose={() => setCreateOpen(false)}

        onSuccess={() => {

          void refetch();

        }}

      />



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



      <StatusCategoryDialog
        open={dialogAction === "activate" || dialogAction === "deactivate"}
        category={selectedCategory}
        mode={dialogAction === "activate" ? "activate" : "deactivate"}
        isLoading={actionLoading || dependencyLoading}
        description={
          dialogAction === "activate"
            ? buildActivateDescription(categoryName)
            : buildDeactivateDescription(
                categoryName,
                dependencySummary,
                dependencyLoading,
              )
        }
        onClose={closeDialog}
        onConfirm={handleConfirmDialog}
      />

      <ArchiveCategoryDialog

        open={dialogAction === "archive"}

        category={selectedCategory}

        isLoading={actionLoading || dependencyLoading}

        description={buildArchiveDescription(categoryName, dependencySummary)}

        onClose={closeDialog}

        onConfirm={handleConfirmDialog}

      />



      <RestoreCategoryDialog

        open={dialogAction === "restore"}

        category={selectedCategory}

        isLoading={actionLoading}

        onClose={closeDialog}

        onConfirm={handleConfirmDialog}

      />



      <PermanentDeleteCategoryDialog

        open={dialogAction === "permanent-delete"}

        category={selectedCategory}

        isLoading={actionLoading || dependencyLoading}

        canDelete={dependencySummary?.canDelete ?? true}

        description={buildPermanentDeleteDescription(

          categoryName,

          dependencySummary,

          dependencyLoading,

        )}

        onClose={closeDialog}

        onConfirm={handleConfirmDialog}

      />



      <ConfirmDialog

        open={bulkConfirmAction !== null}

        title={bulkDialogCopy.title}

        description={bulkDialogCopy.description}

        confirmLabel={bulkDialogCopy.confirmLabel}

        confirmVariant={bulkDialogCopy.confirmVariant}

        loading={bulkActionLoading}

        onConfirm={() => {

          void handleBulkConfirm();

        }}

        onCancel={() => {

          if (!bulkActionLoading) {

            setBulkConfirmAction(null);

          }

        }}

      />

    </>

    </div>

  );

}

