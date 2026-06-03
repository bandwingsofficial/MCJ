"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { BranchForm } from "./branch-form";

import { Branch } from "@/src/features/branches/types/branch.types";

import { useUpdateBranch } from "@/src/features/branches/hooks/use-update-branch";

import {
  CreateBranchFormValues,
} from "@/src/features/branches/schemas/branch.schema";

interface UpdateBranchModalProps {
  open: boolean;

  branch: Branch | null;

  onClose: () => void;

  onSuccess: () => void;
}

export function UpdateBranchModal({
  open,
  branch,
  onClose,
  onSuccess,
}: UpdateBranchModalProps) {
  const {
    updateBranch,
    isPending,
  } = useUpdateBranch();

  if (!branch) {
    return null;
  }

  const handleSubmit =
    async (
      values: CreateBranchFormValues
    ) => {
      await updateBranch(
        branch.id,
        values
      );

      onSuccess();

      onClose();
    };

  return (
    <Modal
      open={open}
      title="Update Branch"
      onClose={onClose}
    >
      <BranchForm
        defaultValues={{
          branchName:
            branch.branchName,

          branchCode:
            branch.branchCode,

          email:
            branch.email,

          phone:
            branch.phone,

          addressLine1:
            branch.addressLine1,

          addressLine2:
            branch.addressLine2 ??
            "",

          city:
            branch.city,

          state:
            branch.state,

          country:
            branch.country,

          postalCode:
            branch.postalCode,

          latitude:
            branch.latitude,

          longitude:
            branch.longitude,

          description:
            branch.description ??
            "",
        }}
        submitLabel="Update Branch"
        isSubmitting={
          isPending
        }
        onSubmit={
          handleSubmit
        }
      />
    </Modal>
  );
}