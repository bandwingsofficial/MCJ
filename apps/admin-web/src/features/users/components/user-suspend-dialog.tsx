"use client";

import { useEffect, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";

import type { AdminUserListItem } from "@/src/features/users/services/admin-users.service";

interface UserSuspendDialogProps {
  open: boolean;
  user: AdminUserListItem | null;
  loading?: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
}

export function UserSuspendDialog({
  open,
  user,
  loading = false,
  onClose,
  onConfirm,
}: UserSuspendDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      setReason("");
    }
  }, [open]);

  return (
    <Modal
      open={open}
      title="Suspend user?"
      onClose={() => {
        if (!loading) onClose();
      }}
    >
      <div className="space-y-4">
        <p className="text-sm text-[#647A9B]">
          {user?.name} will not be able to log in until unsuspended. Referral
          code, wallet, and history are unchanged.
        </p>
        <label className="grid gap-1.5 text-sm">
          <span className="font-medium text-[#102A56]">
            Suspension reason (optional)
          </span>
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Reason for suspension"
          />
        </label>
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            loading={loading}
            onClick={() => onConfirm(reason.trim() || undefined)}
          >
            Suspend
          </Button>
        </div>
      </div>
    </Modal>
  );
}
