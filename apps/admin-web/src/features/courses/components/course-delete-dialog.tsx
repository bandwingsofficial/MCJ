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
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Course"
      description="This action will move the course to archived state."
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}