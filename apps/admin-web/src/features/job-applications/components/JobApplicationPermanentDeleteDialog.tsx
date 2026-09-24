"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";
import type { JobApplication } from "@/src/features/job-applications/types/job-application.types";
import { getApplicantName } from "@/src/features/job-applications/types/job-application.types";

interface Props {
  open: boolean;
  application: JobApplication | null;
  loading?: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  onLoadingChange?: (loading: boolean) => void;
}

export function JobApplicationPermanentDeleteDialog({
  open,
  application,
  loading = false,
  onClose,
  onSuccess,
  onLoadingChange,
}: Props) {
  const handleConfirm = async () => {
    if (!application) {
      return;
    }

    onLoadingChange?.(true);
    try {
      await jobApplicationService.permanentDeleteJobApplication(
        application.id,
      );
      appToast.success("Application permanently deleted");
      await onSuccess();
      onClose();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Failed to permanently delete application";
      appToast.error(message);
    } finally {
      onLoadingChange?.(false);
    }
  };

  const candidateLabel = application ? getApplicantName(application) : null;

  return (
    <ConfirmDialog
      open={open}
      title="Permanently delete application?"
      description={`This will permanently remove this job application and its interview records. This action cannot be undone.${
        candidateLabel ? `\n\n${candidateLabel}` : ""
      }`}
      confirmLabel="Permanently Delete"
      loadingLabel="Permanently Deleting..."
      loading={loading}
      confirmVariant="danger"
      onCancel={onClose}
      onConfirm={() => {
        void handleConfirm();
      }}
    />
  );
}
