"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { BranchUserForm } from "./branch-user-form";

import { useCreateBranchUser } from "@/src/features/branch-users/hooks/use-create-branch-user";

import {
  CreateBranchUserFormValues,
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

  onClose: () => void;

  onSuccess: () => void;

  branchOptions?: BranchOption[];

  fixedBranch?: FixedBranch;
}

export function CreateBranchUserModal({
  open,
  onClose,
  onSuccess,
  branchOptions = [],
  fixedBranch,
}: Props) {
  const {
    createBranchUser,
    isLoading,
  } = useCreateBranchUser();

  const handleSubmit = async (
    values: CreateBranchUserFormValues
  ) => {
    const success =
      await createBranchUser({
        ...values,
        branchId: fixedBranch?.id ?? values.branchId,
      });

    if (!success) {
      return;
    }

    onSuccess();

    onClose();
  };

  return (
    <Modal
      open={open}
      title="Create User"
      onClose={onClose}
    >
      <BranchUserForm
        branchOptions={
          branchOptions
        }
        fixedBranch={fixedBranch}
        isSubmitting={
          isLoading
        }
        submitLabel="Create User"
        onSubmit={handleSubmit as any}
      />
    </Modal>
  );
}
