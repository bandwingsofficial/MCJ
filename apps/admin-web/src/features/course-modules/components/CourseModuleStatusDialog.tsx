"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

import type { CourseModule } from "@/src/features/course-modules/types/course-module.types";

interface Props {
  open: boolean;
  module: CourseModule | null;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function CourseModuleStatusDialog({
  open,
  module,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  const isArchived = Boolean(module?.isDeleted || module?.deletedAt);

  return (
    <ConfirmDialog
      open={open}
      title={isArchived ? "Activate Module" : "Deactivate Module"}
      description={`Are you sure you want to ${
        isArchived ? "activate" : "deactivate"
      } "${module?.title ?? ""}"?`}
      loading={isLoading}
      onCancel={onClose}
      onConfirm={() => {
        void onConfirm();
      }}
    />
  );
}
