"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;

  onClose: () => void;

  onConfirm: () => void;

  isLoading?: boolean;
}

export function CourseDeleteDialog({
  open,
  onClose,
  onConfirm,
  isLoading = false,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Archive course?"
      description="This will archive the course. It will no longer be active, but you can restore it later from the course management page."
      confirmLabel="Archive"
      confirmVariant="danger"
      loading={isLoading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}