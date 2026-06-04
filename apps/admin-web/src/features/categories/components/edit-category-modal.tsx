"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CategoryForm } from "@/src/features/categories/components/category-form";

import { useUpdateCategory } from "@/src/features/categories/hooks/use-update-category";

import type {
  CategoryListItem,
} from "@/src/features/categories/types/category.types";

import type {
  CreateCategoryFormValues,
} from "@/src/features/categories/schemas/category.schema";

interface Props {
  open: boolean;

  category: CategoryListItem | null;

  onClose: () => void;

  onSuccess: () => void;
}

export function EditCategoryModal({
  open,
  category,
  onClose,
  onSuccess,
}: Props) {
  const {
    updateCategory,
    isLoading,
  } =
    useUpdateCategory();

  if (!category) {
    return null;
  }

  const handleSubmit =
    async (
      values: CreateCategoryFormValues
    ) => {
      await updateCategory(
        category.id,
        values
      );

      onSuccess();

      onClose();
    };

  return (
    <Modal
      open={open}
      title="Edit Category"
      onClose={onClose}
    >
      <CategoryForm
        submitLabel="Update Category"
        isLoading={isLoading}
        defaultValues={{
          name: category.name,
          description:
            category.description ??
            "",
          displayOrder:
            category.displayOrder,
        }}
        onSubmit={
          handleSubmit
        }
      />
    </Modal>
  );
}