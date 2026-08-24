"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CategoryForm } from "@/src/features/categories/components/category-form";

import { useCreateCategory } from "@/src/features/categories/hooks/use-create-category";

import { categoryService } from "@/src/features/categories/services/category.service";

import type { CategoryFormValues } from "@/src/features/categories/schemas/category.schema";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCategoryModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const { createCategory, isLoading } = useCreateCategory();

  const handleSubmit = async (
    values: CategoryFormValues,
    image: File | null,
  ) => {
    let thumbnailFileId: string | undefined;

    if (image) {
      const uploadResponse =
        await categoryService.uploadCategoryImage(image);

      thumbnailFileId = uploadResponse.data.fileId;
    }

    await createCategory({
      name: values.name,
      slug: values.slug || undefined,
      description: values.description || undefined,
      thumbnailFileId,
    });

    onSuccess();
    onClose();
  };

  return (
    <Modal open={open} title="Create Category" onClose={onClose}>
      <CategoryForm
        key={open ? "create-category-open" : "create-category-closed"}
        submitLabel="Create Category"
        isSubmitting={isLoading}
        onSubmit={async (values, image) => {
          await handleSubmit(values, image);
        }}
      />
    </Modal>
  );
}
