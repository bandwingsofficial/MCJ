"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { BranchUserForm } from "./branch-user-form";

import {
  DELETED_ACCOUNT_RESTORABLE,
  useCreateBranchUser,
} from "@/src/features/branch-users/hooks/use-create-branch-user";

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

function isRestorableError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: string }).code === DELETED_ACCOUNT_RESTORABLE
  );
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
  const [pendingValues, setPendingValues] =
    useState<CreateBranchUserFormValues | null>(null);

  const submitPayload = async (
    values: CreateBranchUserFormValues,
    confirmRestore = false,
  ) => {
    const {
      confirmPassword: _confirmPassword,
      ...payload
    } = values;

    await createBranchUser({
      ...payload,
      branchId: fixedBranch?.id ?? values.branchId,
      confirmRestore,
    });

    setPendingValues(null);
    onSuccess();
    onClose();
  };

  const handleSubmit = async (
    values: CreateBranchUserFormValues
  ) => {
    try {
      await submitPayload(values, false);
    } catch (error) {
      if (isRestorableError(error)) {
        setPendingValues(values);
        return;
      }
      throw error;
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setPendingValues(null);
    onClose();
  };

  return (
    <>
      <Modal
        open={open}
        title="Create User"
        onClose={handleClose}
      >
        <BranchUserForm
          key={
            open
              ? "create-branch-user-open"
              : "create-branch-user-closed"
          }
          branchOptions={
            branchOptions
          }
          fixedBranch={fixedBranch}
          isSubmitting={
            isLoading
          }
          submitLabel="Create User"
          onSubmit={handleSubmit as never}
        />
      </Modal>

      <ConfirmDialog
        open={pendingValues !== null}
        title="Restore User?"
        description="An inactive account already exists with this email. Creating this user will restore and update that account."
        confirmLabel="Restore & Update"
        confirmVariant="primary"
        loading={isLoading}
        onConfirm={async () => {
          if (!pendingValues) return;
          await submitPayload(pendingValues, true);
        }}
        onCancel={() => {
          if (!isLoading) {
            setPendingValues(null);
          }
        }}
      />
    </>
  );
}
