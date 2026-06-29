"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";

import { CommunityForm } from "./form/CommunityForm";

import { useCreateCommunityPost } from "@/src/features/community/hooks";

interface CommunityCreateModalProps {
  open: boolean;

  onClose: () => void;
}

export function CommunityCreateModal({
  open,
  onClose,
}: CommunityCreateModalProps) {
  const createMutation =
    useCreateCommunityPost();

  const handleSubmit = async (
    values: any,
  ) => {
    await appToast.promise(
      createMutation.mutateAsync(
        values,
      ),
      {
        loading:
          "Creating community post...",

        success:
          "Community post created successfully.",

        error:
          "Failed to create community post.",
      },
    );

    onClose();
  };

  return (
    <Modal
      open={open}
      title="Create Community Post"
      onClose={onClose}
    >
      <CommunityForm
        onSubmit={handleSubmit}
        isSubmitting={
          createMutation.isPending
        }
        onCancel={onClose}
      />
    </Modal>
  );
}