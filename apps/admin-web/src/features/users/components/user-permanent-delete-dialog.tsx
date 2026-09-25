"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { AdminUserListItem } from "@/src/features/users/services/admin-users.service";

interface UserPermanentDeleteDialogProps {
  open: boolean;
  user: AdminUserListItem | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function UserPermanentDeleteDialog({
  open,
  user,
  loading = false,
  onClose,
  onConfirm,
}: UserPermanentDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Permanently delete user?"
      description={`The account will be permanently deleted and cannot be restored. Wallet and referral history are retained for audit where required.${
        user?.name ? `\n\n${user.name}` : ""
      }`}
      confirmLabel="Delete permanently"
      loadingLabel="Deleting..."
      loading={loading}
      confirmVariant="danger"
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}
