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
  | "restore"
  | "permanent-delete"
  | null;

export function CategoriesPage() {
  const {
    categories,
    total,
    isLoading,
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

  const openDeleteDialog = (
    category: CategoryListItem
  ) => {
    setSelectedCategory(category);
    setDialogAction("delete");
  };

  const openRestoreDialog = (
    category: CategoryListItem
  ) => {
    setSelectedCategory(category);
    setDialogAction("restore");
  };

  const openPermanentDeleteDialog = (
    category: CategoryListItem
  ) => {
    setSelectedCategory(category);
    setDialogAction("permanent-delete");
  };

  const closeDialog = () => {
    setDialogAction(null);
    setSelectedCategory(null);
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

          case "restore":
            await restoreCategory(
              category.id
            );
            break;

          case "permanent-delete":
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

  if (error) {
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

        {isLoading ? (
          <SkeletonTable rows={10} />
        ) : (
          <Card className="overflow-hidden p-0 shadow-sm">
            <CategoryTable
              categories={categories}
              actionsDisabled={
                actionLoading ||
                isReordering
              }
              reorderDisabled={
                isReordering ||
                !!filters.status ||
                !!filters.search
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
              onDeactivate={async (
                category
              ) => {
                await deactivateCategory(
                  category.id
                );
                await refetch();
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

            {total > 0 && (
              <div className="flex flex-col gap-2 border-t border-slate-200 px-3.5 py-2.5 sm:flex-row sm:items-center sm:justify-between">
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
                      {[10, 20, 50].map(
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
              </div>
            )}
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
        loading={actionLoading}
        title={
          dialogAction === "restore"
            ? "Restore category?"
            : dialogAction ===
                "permanent-delete"
              ? "Permanently delete category?"
              : "Delete category?"
        }
        description={
          dialogAction === "restore"
            ? "This category will become active again and will be placed at the end of the category order."
            : dialogAction ===
                "permanent-delete"
              ? "This action cannot be undone."
              : "This category will be archived and will remain available for restoration."
        }
        confirmLabel={
          dialogAction === "restore"
            ? "Restore"
            : dialogAction ===
                "permanent-delete"
              ? "Permanently Delete"
              : "Delete"
        }
        loadingLabel={
          dialogAction ===
          "permanent-delete"
            ? "Permanently Deleting..."
            : undefined
        }
        onConfirm={() => {
          void handleConfirmAction();
        }}
        onCancel={closeDialog}
      />
    </>
  );
}
