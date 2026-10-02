"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";

interface Props {
  open: boolean;
  mode: "deactivate" | "activate";
  description: string;
  canProceed: boolean;
  isLoading: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function CourseModuleStatusDialog({
  open,
  mode,
  description,
  canProceed,
  isLoading,
  onClose,
  onConfirm,
}: Props) {
  const isActivate = mode === "activate";

  const title = !canProceed
    ? "Cannot deactivate module"
    : isActivate
      ? "Activate Module"
      : "Deactivate Module";

  return (
    <ConfirmDialog
      open={open}
      title={title}
      description={description}
      confirmLabel={canProceed ? "Confirm" : "OK"}
      confirmVariant={canProceed ? (isActivate ? "primary" : "danger") : "primary"}
      loading={isLoading && canProceed}
      loadingLabel={isActivate ? "Activating..." : "Deactivating..."}
      showCancel={canProceed}
      onCancel={onClose}
      onConfirm={() => {
        if (!canProceed) {
          onClose();
          return;
        }

        void onConfirm();
      }}
    />
  );
}
