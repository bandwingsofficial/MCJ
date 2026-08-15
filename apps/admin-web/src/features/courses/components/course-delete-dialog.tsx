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
      description="This action will move the course to archived state. You can restore it later."
      confirmLabel="Archive"
      confirmVariant="danger"
      loading={isLoading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}