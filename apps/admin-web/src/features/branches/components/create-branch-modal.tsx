"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { BranchForm } from "./branch-form";

import { useCreateBranch } from "@/src/features/branches/hooks/use-create-branch";

import {
  CreateBranchFormValues,
} from "@/src/features/branches/schemas/branch.schema";

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
    values: CreateBranchFormValues
  ) => {
    try {
      await createBranch(values);

      onSuccess();

      onClose();
    } catch {
      // Error toast already handled
      // inside useCreateBranch hook.
    }
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
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}