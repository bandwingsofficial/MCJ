"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { BranchUserForm } from "./branch-user-form";

import { useUpdateBranchUser } from "@/src/features/branch-users/hooks/use-update-branch-user";

import { BranchUser } from "@/src/features/branch-users/types/branch-user.types";

import {
  UpdateBranchUserFormValues,
} from "@/src/features/branch-users/schemas/branch-user.schema";

interface BranchOption {
  label: string;
  value: string;
}

interface Props {
  open: boolean;

  branchUser: BranchUser;

  branchOptions: BranchOption[];

  onClose: () => void;

  onSuccess: () => void;
}

export function UpdateBranchUserModal({
  open,
  branchUser,
  branchOptions,
  onClose,
  onSuccess,
}: Props) {
  const {
    updateBranchUser,
    isLoading,
  } = useUpdateBranchUser();

  const handleSubmit = async (
  values: UpdateBranchUserFormValues
) => {
    const success =
      await updateBranchUser(
        branchUser.id,
        values
      );

    if (!success) {
      return;
    }

    onSuccess();

    onClose();
  };

  return (
    <Modal
      open={open}
      title="Update Branch User"
      onClose={onClose}
    >
      <BranchUserForm
        isEdit
        branchOptions={
          branchOptions
        }
        defaultValues={{
          firstName:
            branchUser.firstName,
          lastName:
            branchUser.lastName,
          email:
            branchUser.email,
          phone:
            branchUser.phone,
          role:
            branchUser.role,
          branchId:
            branchUser.branchId,
          permissions:
            branchUser.permissions,
        }}
        submitLabel="Update User"
        isSubmitting={
          isLoading
        }
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}