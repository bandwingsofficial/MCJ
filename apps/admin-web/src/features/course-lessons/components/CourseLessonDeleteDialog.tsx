"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface CourseLessonDeleteDialogProps {
  open: boolean;
  loading: boolean;
  lessonTitle?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CourseLessonDeleteDialog({
  open,
  loading,
  lessonTitle,
  onClose,
  onConfirm,
}: CourseLessonDeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      title="Delete Lesson"
      description={
        lessonTitle
          ? `Are you sure you want to delete "${lessonTitle}"?`
          : "Are you sure you want to delete this lesson?"
      }
      loading={loading}
      onCancel={onClose}
      onConfirm={onConfirm}
    />
  );
}
