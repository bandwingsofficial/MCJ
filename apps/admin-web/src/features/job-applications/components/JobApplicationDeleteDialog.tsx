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

export function JobApplicationDeleteDialog({
  open,
  applicationId,
  onClose,
  onSuccess,
}: Props) {
  const handleDelete =
    async () => {
      if (!applicationId) {
        return;
      }

      try {
        await jobApplicationService.deleteJobApplication(
          applicationId,
        );

        appToast.success(
          "Application deleted successfully",
        );

        await onSuccess();

        onClose();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to delete application";

        appToast.error(
          message,
        );
      }
    };

  return (
    <ConfirmDialog
      open={open}
      title="Delete Job Application"
      description="Are you sure you want to delete this application?"
      onConfirm={
        handleDelete
      }
      onCancel={
        onClose
      }
    />
  );
}