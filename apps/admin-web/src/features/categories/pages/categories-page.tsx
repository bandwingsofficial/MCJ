"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";
import { Pagination } from "@/src/shared/components/ui/pagination";
import { Card } from "@/src/shared/components/ui/card";
import { appToast } from "@/src/shared/components/ui/toast";

import { useCategories } from "@/src/features/categories/hooks/use-categories";
import { useCategoryActions } from "@/src/features/categories/hooks/use-category-actions";

import { CategoryFilters } from "@/src/features/categories/components/category-filters";
import { CategoryTable } from "@/src/features/categories/components/category-table";
import { CreateCategoryModal } from "@/src/features/categories/components/create-category-modal";
import { EditCategoryModal } from "@/src/features/categories/components/edit-category-modal";
import { DeleteCategoryDialog } from "@/src/features/categories/components/delete-category-dialog";

import { categoryService } from "@/src/features/categories/services/category.service";

import type {
  CategoryListItem,
} from "@/src/features/categories/types/category.types";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

type DialogAction =
  | "delete"
  | "deactivate"
  | "restore"
  | "permanent-delete"
  | null;

export function CategoriesPage() {
  const {
    categories,
    total,
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

  const [createOpen, setCreateOpen] =
    useState(false);

  const [editOpen, setEditOpen] =
    useState(false);

  const [
    selectedCategory,
    setSelectedCategory,
  ] =
    useState<CategoryListItem | null>(
      null
    );

  const [
    dialogAction,
    setDialogAction,
  ] = useState<DialogAction>(null);

  const [dependencySummary, setDependencySummary] =
    useState<{
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
    } | null>(null);

  const [dependencyLoading, setDependencyLoading] =
    useState(false);

  const [
    isReordering,
    setIsReordering,
  ] = useState(false);

  const totalPages = Math.max(
    1,
    Math.ceil(total / filters.pageSize)
  );

  const handleEdit = (
    category: CategoryListItem
  ) => {
    setSelectedCategory(category);
    setEditOpen(true);
  };

  const openDeactivateDialog = async (
    category: CategoryListItem
  ) => {
    setSelectedCategory(category);
    setDependencySummary(null);
    setDependencyLoading(true);
    setDialogAction("deactivate");

    try {
      const response =
        await categoryService.getCategoryDependencies(
          category.id
        );
      setDependencySummary({
        canDelete: response.data.canDelete,
        removable: response.data.removable,
        blocking: response.data.blocking,
      });

      if (response.data.removable.branches === 0) {
        setDialogAction(null);
        setSelectedCategory(null);
        setDependencySummary(null);
        await deactivateCategory(category.id);
        await refetch();
      }
    } catch (error) {
      appToast.error(
        getErrorMessage(error) ||
          "Unable to verify category assignments. Please try again."
      );
      setDialogAction(null);
      setSelectedCategory(null);
      setDependencySummary(null);
    } finally {
      setDependencyLoading(false);
    }
  };

  const openDeleteDialog = async (
    category: CategoryListItem
  ) => {
    setSelectedCategory(category);
    setDependencySummary(null);
    setDependencyLoading(true);
    setDialogAction("delete");

    try {
      const response =
        await categoryService.getCategoryDependencies(
          category.id
        );
      setDependencySummary({
        canDelete: response.data.canDelete,
        removable: response.data.removable,
        blocking: response.data.blocking,
      });
    } catch (error) {
      appToast.error(
        getErrorMessage(error) ||
          "Unable to verify category assignments. Please try again."
      );
      setDialogAction(null);
      setSelectedCategory(null);
      setDependencySummary(null);
    } finally {
      setDependencyLoading(false);
    }
  };

  const openRestoreDialog = (
    category: CategoryListItem
  ) => {
    setSelectedCategory(category);
    setDialogAction("restore");
  };

  const openPermanentDeleteDialog = async (
    category: CategoryListItem
  ) => {
    setSelectedCategory(category);
    setDependencySummary(null);
    setDependencyLoading(true);
    setDialogAction("permanent-delete");

    try {
      const response =
        await categoryService.getCategoryDependencies(
          category.id
        );
      setDependencySummary({
        canDelete: response.data.canDelete,
        removable: response.data.removable,
        blocking: response.data.blocking,
      });
    } catch (error) {
      appToast.error(
        getErrorMessage(error) ||
          "Unable to verify category dependencies. Please try again."
      );
      setDialogAction(null);
      setSelectedCategory(null);
    } finally {
      setDependencyLoading(false);
    }
  };

  const closeDialog = () => {
    setDialogAction(null);
    setSelectedCategory(null);
    setDependencySummary(null);
    setDependencyLoading(false);
  };

  const handleConfirmAction =
    async () => {
      const action = dialogAction;
      const category = selectedCategory;

      if (!category || !action) {
        return;
      }

      try {
        switch (action) {
          case "delete":
            await deleteCategory(
              category.id
            );
            break;

          case "deactivate":
            await deactivateCategory(
              category.id
            );
            break;

          case "restore":
            await restoreCategory(
              category.id
            );
            break;

          case "permanent-delete":
            if (
              dependencySummary &&
              !dependencySummary.canDelete
            ) {
              return;
            }
            await permanentlyDeleteCategory(
              category.id
            );
            break;
        }

        closeDialog();
        await refetch();
      } catch {
        // Toast already handled in hook; keep dialog open for retry
      }
    };

  const handleReorder = async (payload: {
    categoryId: string;
    newDisplayOrder: number;
  }) => {
    try {
      setIsReordering(true);
      await categoryService.reorderCategories(
        payload
      );
      appToast.success(
        "Category order updated"
      );
      await refetch();
    } catch (error) {
      appToast.error(
        getErrorMessage(error)
      );
      throw error;
    } finally {
      setIsReordering(false);
    }
  };

  // Hard error only when we have nothing to show yet.
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
    total === 0
      ? 0
      : (filters.page - 1) *
          filters.pageSize +
        1;
  const to = Math.min(
    filters.page * filters.pageSize,
    total
  );

  return (
    <>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Categories
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            Manage LMS categories
          </p>
        </div>

        <Button
          onClick={() =>
            setCreateOpen(true)
          }
          className="h-9 rounded-lg px-4"
        >
          Create Category
        </Button>
      </div>

      <div className="space-y-3">
        <div className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <CategoryFilters
            filters={filters}
            onChange={setFilters}
          />
        </div>

        {isInitialLoading ? (
          <SkeletonTable rows={10} />
        ) : (
          <Card className="overflow-hidden p-0 shadow-sm">
            {error && (
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
            )}

            <div
              aria-busy={isFetching}
              className="relative"
            >
              {isFetching && (
                <span className="sr-only">
                  Updating categories
                </span>
              )}

              <CategoryTable
                categories={categories}
                actionsDisabled={
                  actionLoading ||
                  isReordering ||
                  isFetching
                }
                reorderDisabled={
                  isReordering ||
                  !!filters.status ||
                  !!filters.search.trim() ||
                  isFetching
                }
                onEdit={handleEdit}
                onActivate={async (
                  category
                ) => {
                  await activateCategory(
                    category.id
                  );
                  await refetch();
                }}
                onDeactivate={(category) => {
                  void openDeactivateDialog(
                    category
                  );
                }}
                onDelete={
                  openDeleteDialog
                }
                onRestore={
                  openRestoreDialog
                }
                onPermanentDelete={
                  openPermanentDeleteDialog
                }
                onReorder={handleReorder}
              />
            </div>

            <div className="flex min-h-[3.25rem] flex-col gap-2 border-t border-slate-200 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
              {total > 0 ? (
                <>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] text-slate-600">
                    <span className="leading-9">
                      Showing {from}–{to} of{" "}
                      {total}
                    </span>

                    <label className="flex items-center gap-2 leading-9">
                      <span className="whitespace-nowrap">
                        Rows per page
                      </span>
                      <select
                        className="h-9 rounded-lg border border-slate-300 bg-white px-2 text-[15px]"
                        value={
                          filters.pageSize
                        }
                        onChange={(
                          event
                        ) =>
                          setFilters({
                            ...filters,
                            pageSize:
                              Number(
                                event
                                  .target
                                  .value
                              ),
                          })
                        }
                      >
                        {[10, 20, 50, 100].map(
                          (size) => (
                            <option
                              key={size}
                              value={size}
                            >
                              {size}
                            </option>
                          )
                        )}
                      </select>
                    </label>
                  </div>

                  <Pagination
                    page={filters.page}
                    totalPages={
                      totalPages
                    }
                    onPageChange={(
                      page
                    ) =>
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
          </Card>
        )}
      </div>

      <CreateCategoryModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
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

      <DeleteCategoryDialog
        open={dialogAction !== null}
        loading={
          actionLoading ||
          ((dialogAction === "permanent-delete" ||
            dialogAction === "deactivate" ||
            dialogAction === "delete") &&
            dependencyLoading)
        }
        title={
          dialogAction === "restore"
            ? "Restore category?"
            : dialogAction === "permanent-delete"
              ? dependencyLoading
                ? "Permanently delete category?"
                : dependencySummary &&
                    !dependencySummary.canDelete
                  ? "Cannot permanently delete category"
                  : "Permanently delete category?"
              : dialogAction === "deactivate"
                ? "Category is assigned to branches"
                : dependencySummary &&
                    dependencySummary.removable.branches > 0
                  ? "Category is assigned to branches"
                  : "Archive category?"
        }
        description={
          dialogAction === "restore"
            ? "This category will become active again and will be placed at the end of the category order."
            : dialogAction === "permanent-delete"
              ? dependencyLoading
                ? "Checking category dependencies..."
                : (() => {
                    if (!dependencySummary) {
                      return "Unable to verify category dependencies. Please try again.";
                    }

                    const name =
                      selectedCategory?.name ??
                      "This category";

                    if (!dependencySummary.canDelete) {
                      const lines: string[] = [];
                      if (
                        dependencySummary.blocking.courses >
                        0
                      ) {
                        lines.push(
                          `Courses        ${dependencySummary.blocking.courses}`
                        );
                      }
                      if (
                        dependencySummary.blocking
                          .enrollments > 0
                      ) {
                        lines.push(
                          `Enrollments    ${dependencySummary.blocking.enrollments}`
                        );
                      }
                      if (
                        dependencySummary.blocking.articles >
                        0
                      ) {
                        lines.push(
                          `Articles       ${dependencySummary.blocking.articles}`
                        );
                      }

                      return `${name} is referenced by required records:\n\n${lines.join("\n")}\n\nThese must be reassigned to another category before this category can be deleted.`;
                    }

                    const removableLines: string[] = [];
                    if (
                      dependencySummary.removable.branches >
                      0
                    ) {
                      removableLines.push(
                        `Branches       ${dependencySummary.removable.branches}`
                      );
                    }
                    if (
                      dependencySummary.removable.courses > 0
                    ) {
                      removableLines.push(
                        `Courses        ${dependencySummary.removable.courses}`
                      );
                    }
                    if (
                      dependencySummary.removable
                        .enrollments > 0
                    ) {
                      removableLines.push(
                        `Enrollments    ${dependencySummary.removable.enrollments}`
                      );
                    }
                    if (
                      dependencySummary.removable.articles >
                      0
                    ) {
                      removableLines.push(
                        `Articles       ${dependencySummary.removable.articles}`
                      );
                    }

                    if (removableLines.length > 0) {
                      const branchCount =
                        dependencySummary.removable.branches;
                      const branchSentence =
                        branchCount > 0
                          ? `${name} is assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}.\n\nPermanently deleting this Category will remove its Category assignments.`
                          : `${name} is currently used by:\n\n${removableLines.join("\n")}\n\nThese Category assignments will be removed.`;

                      return `${branchSentence}\n\nThis action cannot be undone.\n\nAre you sure you want to continue?`;
                    }

                    return "This action cannot be undone.\n\nAre you sure you want to continue?";
                  })()
              : dialogAction === "deactivate"
                ? (() => {
                    const branchCount =
                      dependencySummary?.removable.branches ??
                      0;
                    const name =
                      selectedCategory?.name ??
                      "This category";
                    return `${name} is currently assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}.\n\nDeactivating it will remove it from those Branch assignments.\n\nDo you want to continue?`;
                  })()
                : dependencySummary &&
                    dependencySummary.removable.branches > 0
                  ? (() => {
                      const branchCount =
                        dependencySummary.removable.branches;
                      const name =
                        selectedCategory?.name ??
                        "This category";
                      return `${name} is currently assigned to ${branchCount} branch${branchCount === 1 ? "" : "es"}.\n\nArchiving it will remove it from those Branch assignments. Continue?`;
                    })()
                  : "This category will be archived and will remain available for restoration."
        }
        confirmLabel={
          dialogAction === "restore"
            ? "Restore"
            : dialogAction === "permanent-delete"
              ? dependencySummary &&
                !dependencySummary.canDelete
                ? "Close"
                : "Permanently Delete"
              : dialogAction === "deactivate"
                ? "Deactivate"
                : "Archive"
        }
        confirmVariant={
          dialogAction === "permanent-delete" &&
          dependencySummary &&
          !dependencySummary.canDelete
            ? "outline"
            : "danger"
        }
        showCancel={
          !(
            dialogAction === "permanent-delete" &&
            dependencySummary &&
            !dependencySummary.canDelete
          )
        }
        loadingLabel={
          dialogAction === "permanent-delete"
            ? dependencyLoading
              ? "Checking..."
              : "Permanently Deleting..."
            : undefined
        }
        onConfirm={() => {
          if (
            dialogAction === "permanent-delete" &&
            dependencySummary &&
            !dependencySummary.canDelete
          ) {
            closeDialog();
            return;
          }
          void handleConfirmAction();
        }}
        onCancel={closeDialog}
      />
    </>
  );
}
