"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { BranchListItem } from "@/src/features/branches/types/branch.types";

interface DeleteBranchDialogProps {
  open: boolean;

  branch: BranchListItem | null;

  isLoading: boolean;

  onClose: () => void;

  onConfirm: () => Promise<void>;
}

export function DeleteBranchDialog({
  open,
  branch,
  isLoading,
  onClose,
  onConfirm,
}: DeleteBranchDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Archive branch?"
      description={`This branch will be archived and will remain available for restoration.${
        branch?.branchName
          ? ` (${branch.branchName})`
          : ""
      }`}
      confirmLabel="Archive"
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
