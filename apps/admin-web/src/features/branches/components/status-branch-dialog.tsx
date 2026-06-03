"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { BranchListItem } from "@/src/features/branches/types/branch.types";

interface StatusBranchDialogProps {
  open: boolean;

  branch: BranchListItem | null;

  isLoading: boolean;

  onClose: () => void;

  onConfirm: () => Promise<void>;
}

export function StatusBranchDialog({
  open,
  branch,
  isLoading,
  onClose,
  onConfirm,
}: StatusBranchDialogProps) {
  const isActive =
    branch?.status === "ACTIVE";

  return (
    <ConfirmDialog
      open={open}
      title={
        isActive
          ? "Deactivate Branch"
          : "Activate Branch"
      }
      description={`Are you sure you want to ${
        isActive
          ? "deactivate"
          : "activate"
      } ${branch?.branchName ?? ""}?`}
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}