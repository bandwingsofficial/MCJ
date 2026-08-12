"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CategoryForm } from "@/src/features/categories/components/category-form";

import { useUpdateCategory } from "@/src/features/categories/hooks/use-update-category";

import { categoryService } from "@/src/features/categories/services/category.service";

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
  } = useUpdateCategory();

  if (!open || !category) {
    return null;
  }

  const handleSubmit = async (
    values: CreateCategoryFormValues,
    image: File | null,
    removeImage: boolean
  ) => {
    let thumbnailFileId: string | null | undefined;

    if (image) {
      const uploadResponse =
        await categoryService.uploadCategoryImage(
          image
        );

      thumbnailFileId =
        uploadResponse.data.fileId;
    } else if (removeImage) {
      thumbnailFileId = null;
    }

    await updateCategory(
      category.id,
      {
        name: values.name,
        description: values.description,
        thumbnailFileId,
      }
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
          thumbnailUrl:
            category.thumbnailUrl,
        }}
        onSubmit={
          handleSubmit
        }
      />
    </Modal>
  );
}
