"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import { BranchListItem } from "@/src/features/branches/types/branch.types";

interface PermanentDeleteBranchDialogProps {
  open: boolean;

  branch: BranchListItem | null;

  isLoading: boolean;

  onClose: () => void;

  onConfirm: () => Promise<void>;
}

export function PermanentDeleteBranchDialog({
  open,
  branch,
  isLoading,
  onClose,
  onConfirm,
}: PermanentDeleteBranchDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Permanently delete branch?"
      description={`This action cannot be undone.${
        branch?.branchName
          ? ` (${branch.branchName})`
          : ""
      }`}
      confirmLabel="Permanently Delete"
      loadingLabel="Permanently Deleting..."
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
