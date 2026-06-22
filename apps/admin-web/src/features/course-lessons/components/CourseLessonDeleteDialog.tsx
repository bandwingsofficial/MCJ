"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface CourseLessonDeleteDialogProps {
  open: boolean;

  loading: boolean;

  onClose: () => void;

  onConfirm: () => void;
}

export function CourseLessonDeleteDialog({
  open,
  loading,
  onClose,
  onConfirm,
}: CourseLessonDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Lesson"
      description="This lesson will be moved to deleted items. You can restore it later."
      loading={loading}
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}