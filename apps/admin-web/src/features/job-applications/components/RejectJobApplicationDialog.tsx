"use client";

import { useEffect, useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";

interface RejectJobApplicationDialogProps {
  open: boolean;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function RejectJobApplicationDialog({
  open,
  loading = false,
  onConfirm,
  onClose,
}: RejectJobApplicationDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (!open) {
      setReason("");
    }
  }, [open]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      return;
    }

    onConfirm(reason.trim());
  };

  return (
    <Modal open={open} title="Reject Application" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Provide a rejection reason. The student will see this message on their
          application.
        </p>

        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Rejection reason..."
          className="min-h-28"
          disabled={loading}
        />

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={loading}
            disabled={!reason.trim()}
          >
            Reject Application
          </Button>
        </div>
      </div>
    </Modal>
  );
}
