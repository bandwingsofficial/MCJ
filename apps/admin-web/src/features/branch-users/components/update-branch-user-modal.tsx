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

interface FixedBranch {
  id: string;
  label: string;
}

interface Props {
  open: boolean;

  branchUser: BranchUser;

  branchOptions?: BranchOption[];

  fixedBranch?: FixedBranch;

  onClose: () => void;

  onSuccess: () => void;
}

export function UpdateBranchUserModal({
  open,
  branchUser,
  branchOptions = [],
  fixedBranch,
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
    const payload = fixedBranch
      ? {
          ...values,
          branchId: fixedBranch.id,
        }
      : values;

    const success =
      await updateBranchUser(
        branchUser.id,
        payload
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
      title="Update User"
      onClose={onClose}
    >
      <BranchUserForm
        isEdit
        branchOptions={
          branchOptions
        }
        fixedBranch={fixedBranch}
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
            fixedBranch?.id ?? branchUser.branchId,
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
