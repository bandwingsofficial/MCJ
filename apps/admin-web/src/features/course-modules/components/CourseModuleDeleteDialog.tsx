"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

export interface ModuleDeleteContentCounts {
  lessons: number;
  resources: number;
  quizzes: number;
  assignments: number;
}

interface Props {
  open: boolean;
  moduleTitle?: string;
  description: string;
  canDelete: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function CourseModuleDeleteDialog({
  open,
  description,
  canDelete,
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  return (
    <ConfirmDialog
      open={open}
      title={canDelete ? "Delete Module?" : "Cannot delete module"}
      description={description}
      confirmLabel={canDelete ? "Delete Module" : "OK"}
      loadingLabel="Deleting..."
      confirmVariant={canDelete ? "danger" : "primary"}
      loading={loading && canDelete}
      showCancel={canDelete}
      onConfirm={() => {
        if (!canDelete) {
          onClose();
          return;
        }

        onConfirm();
      }}
      onCancel={onClose}
    />
  );
}
