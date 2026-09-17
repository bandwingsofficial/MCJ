"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { BranchForm } from "./branch-form";

import { useCreateBranch } from "@/src/features/branches/hooks/use-create-branch";

import {
  CreateBranchFormValues,
} from "@/src/features/branches/schemas/branch.schema";

import { branchService } from "@/src/features/branches/services/branch.service";
import { getUploadFileId } from "@/src/shared/utils/upload-image.util";

interface CreateBranchModalProps {
  open: boolean;

  onClose: () => void;

  onSuccess: () => void;
}

export function CreateBranchModal({
  open,
  onClose,
  onSuccess,
}: CreateBranchModalProps) {
  const {
    createBranch,
    isPending,
  } = useCreateBranch();

  const handleSubmit = async (
    values: CreateBranchFormValues,
    image: File | null,
  ) => {
    let thumbnailFileId: string | undefined;

    if (image) {
      const uploadResponse = await branchService.uploadBranchImage(image);
      thumbnailFileId = getUploadFileId(uploadResponse);
    }

    await createBranch({
      ...values,
      thumbnailFileId,
    });
    onSuccess();
    onClose();
  };

  return (
    <Modal
      open={open}
      title="Create Branch"
      onClose={onClose}
    >
      <BranchForm
        key={open ? "create-branch-open" : "create-branch-closed"}
        submitLabel="Create Branch"
        isSubmitting={isPending}
        onSubmit={async (values, image) => {
          await handleSubmit(values, image);
        }}
      />
    </Modal>
  );
}
