"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CommunityForm } from "@/src/features/community/components/form/CommunityForm";
import { useUpdateCommunityPost } from "@/src/features/community/hooks/use-update-community-post";

import type { CommunityFormValues } from "@/src/features/community/schemas/community.schema";
import type { CommunityPostDetails } from "@/src/features/community/types/community.types";
import type { CommunityUploadFiles } from "@/src/features/community/hooks/use-create-community-post";

interface Props {
  open: boolean;
  post: CommunityPostDetails | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function EditCommunityPostModal({
  open,
  post,
  onClose,
  onSuccess,
}: Props) {
  const { updateCommunityPost, isPending, fieldErrors } =
    useUpdateCommunityPost();

  const handleSubmit = async (
    values: CommunityFormValues,
    files: CommunityUploadFiles,
  ) => {
    if (!post) {
      return;
    }

    const success = await updateCommunityPost(post.id, values, files);

    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title="Edit Community Post"
      onClose={onClose}
      bodyClassName="overflow-y-auto bg-white px-6 py-5"
    >
      {post ? (
        <CommunityForm
          key={post.id}
          mode="edit"
          initialData={post}
          isSubmitting={isPending}
          externalErrors={fieldErrors}
          onSubmit={handleSubmit}
          onCancel={onClose}
        />
      ) : null}
    </Modal>
  );
}
