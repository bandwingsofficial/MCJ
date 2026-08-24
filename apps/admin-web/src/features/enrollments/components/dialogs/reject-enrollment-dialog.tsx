"use client";

import { useState } from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { Textarea } from "@/src/shared/components/ui/textarea";

interface RejectEnrollmentDialogProps {
  open: boolean;
  loading?: boolean;
  onConfirm: (reason: string) => void;
  onClose: () => void;
}

export function RejectEnrollmentDialog({
  open,
  loading = false,
  onConfirm,
  onClose,
}: RejectEnrollmentDialogProps) {
  const [reason, setReason] = useState("");

  const handleConfirm = () => {
    if (!reason.trim()) {
      return;
    }

    onConfirm(reason.trim());
  };

  return (
    <Modal
      open={open}
      title="Reject Enrollment"
      onClose={onClose}
    >
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          Provide a reason for rejecting this enrollment. The student will see
          this message in their enrollment history.
        </p>

        <Textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          placeholder="Reason for rejection..."
          className="min-h-28"
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
            Reject Enrollment
          </Button>
        </div>
      </div>
    </Modal>
  );
}
