"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;
  moduleTitle?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CourseModuleDeleteDialog({
  open,
  moduleTitle,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Module?"
      description={`Are you sure you want to delete "${
        moduleTitle ?? "this module"
      }"? This action will remove the module from the course.`}
      confirmLabel="Delete"
      loading={loading}
      onConfirm={onConfirm}
      onCancel={onClose}
    />
  );
}
