"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CommunityForm } from "@/src/features/community/components/form/CommunityForm";
import { useCreateCommunityPost } from "@/src/features/community/hooks/use-create-community-post";

import type { CommunityFormValues } from "@/src/features/community/schemas/community.schema";
import type { CommunityUploadFiles } from "@/src/features/community/hooks/use-create-community-post";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CreateCommunityPostModal({
  open,
  onClose,
  onSuccess,
}: Props) {
  const { createCommunityPost, isPending, fieldErrors } =
    useCreateCommunityPost();

  const handleSubmit = async (
    values: CommunityFormValues,
    files: CommunityUploadFiles,
  ) => {
    const success = await createCommunityPost(values, files);

    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title="Create Community Post"
      onClose={onClose}
      bodyClassName="overflow-y-auto bg-white px-6 py-5"
    >
      <CommunityForm
        key={open ? "create-community-open" : "create-community-closed"}
        mode="create"
        isSubmitting={isPending}
        externalErrors={fieldErrors}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
