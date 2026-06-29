"use client";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";

import { CommunityForm } from "./form/CommunityForm";

import { useUpdateCommunityPost } from "@/src/features/community/hooks";

import type {
  CommunityPost,
  UpdateCommunityPostRequest,
} from "@/src/features/community/types/community.types";

interface CommunityEditModalProps {
  open: boolean;

  post: CommunityPost | null;

  onClose: () => void;
}

export function CommunityEditModal({
  open,
  post,
  onClose,
}: CommunityEditModalProps) {
  const updateMutation =
    useUpdateCommunityPost();

  const handleSubmit = async (
    values: UpdateCommunityPostRequest,
  ) => {
    if (!post) {
      return;
    }

    await appToast.promise(
      updateMutation.mutateAsync({
        id: post.id,
        data: values,
      }),
      {
        loading:
          "Updating community post...",

        success:
          "Community post updated successfully.",

        error:
          "Failed to update community post.",
      },
    );

    onClose();
  };

  return (
    <Modal
      open={open}
      title="Edit Community Post"
      onClose={onClose}
    >
      {post && (
        <CommunityForm
          initialData={post}
          onSubmit={handleSubmit}
          isSubmitting={
            updateMutation.isPending
          }
          onCancel={onClose}
        />
      )}
    </Modal>
  );
}