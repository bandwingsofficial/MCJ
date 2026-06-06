"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { PageHeader } from "@/src/shared/components/ui/page-header";
import { SkeletonTable } from "@/src/shared/components/ui/skeleton-table";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import { useCategories } from "@/src/features/categories/hooks/use-categories";
import { useCategoryActions } from "@/src/features/categories/hooks/use-category-actions";

import { CategoryFilters } from "@/src/features/categories/components/category-filters";
import { CategoryTable } from "@/src/features/categories/components/category-table";
import { CreateCategoryModal } from "@/src/features/categories/components/create-category-modal";
import { EditCategoryModal } from "@/src/features/categories/components/edit-category-modal";
import { DeleteCategoryDialog } from "@/src/features/categories/components/delete-category-dialog";

import type {
  CategoryListItem,
} from "@/src/features/categories/types/category.types";
import { Card } from "@/src/shared/components/ui/card";

type DialogAction =
  | "delete"
  | "restore"
  | "permanent-delete"
  | null;

export function CategoriesPage() {
  const {
    categories,
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

  const [
    createOpen,
    setCreateOpen,
  ] = useState(false);

  const [
    editOpen,
    setEditOpen,
  ] = useState(false);

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

  const openPermanentDeleteDialog =
    (
      category: CategoryListItem
    ) => {
      setSelectedCategory(category);
      setDialogAction(
        "permanent-delete"
      );
    };

  const closeDialog = () => {
    setDialogAction(null);
    setSelectedCategory(null);
  };

  const handleConfirmAction =
    async () => {
      if (!selectedCategory) {
        return;
      }

      switch (dialogAction) {
        case "delete":
          await deleteCategory(
            selectedCategory.id
          );
          break;

        case "restore":
          await restoreCategory(
            selectedCategory.id
          );
          break;

        case "permanent-delete":
          await permanentlyDeleteCategory(
            selectedCategory.id
          );
          break;
      }

      await refetch();

      closeDialog();
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

  return (
    <>
      <PageHeader
        title="Categories"
        description="Manage LMS categories"
        actions={
          <Button
            onClick={() =>
              setCreateOpen(true)
            }
          >
            Create Category
          </Button>
        }
      />
    
      <div className="space-y-6">
        
         <Card>
          <div className="p-0"><CategoryFilters
          filters={filters}
          onChange={setFilters}
        />
  </div>
        </Card>
        {isLoading ? (
          <SkeletonTable
            rows={10}
          />
        ) : (
          <CategoryTable
            categories={categories}
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
          />
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
        category={
          selectedCategory
        }
        onClose={() => {
          setEditOpen(false);
          setSelectedCategory(
            null
          );
        }}
        onSuccess={() => {
          void refetch();
        }}
      />

      <DeleteCategoryDialog
        open={
          dialogAction !== null
        }
        loading={
          actionLoading
        }
        title={
          dialogAction ===
          "restore"
            ? "Restore Category"
            : dialogAction ===
              "permanent-delete"
            ? "Permanently Delete Category"
            : "Delete Category"
        }
        description={
          dialogAction ===
          "restore"
            ? "Restore this category?"
            : dialogAction ===
              "permanent-delete"
            ? "This action cannot be undone."
            : "Move category to archive?"
        }
        onConfirm={() => {
          void handleConfirmAction();
        }}
        onCancel={closeDialog}
      />
    </>
  );
}