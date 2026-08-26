"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CategoryForm } from "@/src/features/categories/components/category-form";

import { useUpdateCategory } from "@/src/features/categories/hooks/use-update-category";

import { categoryService } from "@/src/features/categories/services/category.service";

import type { CategoryListItem } from "@/src/features/categories/types/category.types";
import type { CategoryFormValues } from "@/src/features/categories/schemas/category.schema";

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
  const { updateCategory, isLoading } = useUpdateCategory();

  if (!open || !category) {
    return null;
  }

  const handleSubmit = async (
    values: CategoryFormValues,
    image: File | null,
    removeImage: boolean,
  ) => {
    let thumbnailFileId: string | null | undefined;

    if (image) {
      const uploadResponse =
        await categoryService.uploadCategoryImage(image);

      thumbnailFileId = uploadResponse.data.fileId;
    } else if (removeImage) {
      thumbnailFileId = null;
    }

    await updateCategory(category.id, {
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      displayOrder:
        values.displayOrder === undefined || Number.isNaN(values.displayOrder)
          ? undefined
          : values.displayOrder,
      thumbnailFileId,
    });

    onSuccess();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Edit Category"
      onClose={onClose}
      contentClassName="!max-w-xl"
    >
      <CategoryForm
        key={category.id}
        excludeId={category.id}
        submitLabel="Update Category"
        isSubmitting={isLoading}
        defaultValues={{
          name: category.name,
          slug: category.slug,
          description: category.description ?? "",
          displayOrder: category.displayOrder ?? undefined,
          thumbnailUrl: category.thumbnailUrl,
        }}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
