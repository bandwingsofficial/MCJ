"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CategoryForm } from "@/src/features/categories/components/category-form";

import { useCreateCategory } from "@/src/features/categories/hooks/use-create-category";

import { categoryService } from "@/src/features/categories/services/category.service";

import type {
  CreateCategoryFormValues,
} from "@/src/features/categories/schemas/category.schema";

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
  const {
    createCategory,
    isLoading,
  } = useCreateCategory();

  const handleSubmit = async (
    values: CreateCategoryFormValues,
    image: File | null,
    _removeImage: boolean
  ) => {
    let thumbnailFileId: string | undefined;

    if (image) {
      const uploadResponse =
        await categoryService.uploadCategoryImage(
          image
        );

      thumbnailFileId =
        uploadResponse.data.fileId;
    }

    const result =
      await createCategory({
        name: values.name,
        description: values.description,
        status: values.status ?? "ACTIVE",
        thumbnailFileId,
      });

    if (!result) {
      return;
    }

    onSuccess();

    onClose();
  };

  return (
    <Modal
      open={open}
      title="Create Category"
      onClose={onClose}
    >
      <CategoryForm
        submitLabel="Create Category"
        isLoading={isLoading}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
