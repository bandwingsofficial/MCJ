"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface AdmitEnrollmentConfirmDialogProps {
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function AdmitEnrollmentConfirmDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: AdmitEnrollmentConfirmDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Admit this student?"
      description={
        "This will change the enrollment status from Advanced to Admitted."
      }
      confirmLabel="Confirm"
      confirmVariant="primary"
      loading={loading}
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}
