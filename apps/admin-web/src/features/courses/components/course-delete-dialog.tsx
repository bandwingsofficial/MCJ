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
      title="Delete course?"
      description="This will move the course to an archived state. You can restore it later from the course management page."
      confirmLabel="Delete"
      confirmVariant="danger"
      loading={isLoading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}