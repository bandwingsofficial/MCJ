"use client";

import { ConfirmDialog } from "@/src/shared/components/ui/dialog";
import { appToast } from "@/src/shared/components/ui/toast";

import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";

interface Props {
  open: boolean;

  applicationId: string | null;

  onClose: () => void;

  onSuccess: () => Promise<void>;
}

export function JobApplicationRestoreDialog({
  open,
  applicationId,
  onClose,
  onSuccess,
}: Props) {
  const handleRestore =
    async () => {
      if (!applicationId) {
        return;
      }

      try {
        await jobApplicationService.restoreJobApplication(
          applicationId,
        );

        appToast.success(
          "Application restored successfully",
        );

        await onSuccess();

        onClose();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to restore application";

        appToast.error(
          message,
        );
      }
    };

  return (
    <ConfirmDialog
      open={open}
      title="Restore Job Application"
      description="Do you want to restore this application?"
      onConfirm={
        handleRestore
      }
      onCancel={
        onClose
      }
    />
  );
}