"use client";

import {
  useEffect,
  useState,
} from "react";

import { Button } from "@/src/shared/components/ui/button";
import { Modal } from "@/src/shared/components/ui/model";
import { AppSelect } from "@/src/shared/components/ui/select";
import { appToast } from "@/src/shared/components/ui/toast";

import {
  JOB_APPLICATION_STATUS_FLOW,
} from "@/src/features/job-applications/constants/job-application.constants";

import { jobApplicationService } from "@/src/features/job-applications/services/job-application.service";

import type {
  JobApplication,
  JobApplicationStatus,
} from "@/src/features/job-applications/types/job-application.types";

interface Props {
  open: boolean;

  application: JobApplication | null;

  onClose: () => void;

  onSuccess: () => Promise<void>;
}

export function JobApplicationStatusDialog({
  open,
  application,
  onClose,
  onSuccess,
}: Props) {
  const [
    status,
    setStatus,
  ] =
    useState<JobApplicationStatus>();

  const [
    loading,
    setLoading,
  ] = useState(false);

  useEffect(() => {
    if (application) {
      const next =
        JOB_APPLICATION_STATUS_FLOW[
          application.status
        ][0];

      setStatus(next);
    }
  }, [application]);

  if (!application) {
    return null;
  }

  const handleSubmit =
    async () => {
      if (!status) {
        return;
      }

      try {
        setLoading(true);

        await jobApplicationService.updateStatus(
          application.id,
          {
            status,
          },
        );

        appToast.success(
          "Status updated successfully",
        );

        await onSuccess();

        onClose();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to update status";

        appToast.error(
          message,
        );
      } finally {
        setLoading(false);
      }
    };

  return (
    <Modal
      open={open}
      title="Update Application Status"
      onClose={onClose}
    >
      <div className="space-y-5">
        <AppSelect
          value={
            status ?? ""
          }
          onValueChange={(
            value,
          ) =>
            setStatus(
              value as JobApplicationStatus,
            )
          }
          options={JOB_APPLICATION_STATUS_FLOW[
            application.status
          ].map(
            (
              value,
            ) => ({
              label:
                value,
              value,
            }),
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={
              onClose
            }
          >
            Cancel
          </Button>

          <Button
            loading={
              loading
            }
            onClick={
              handleSubmit
            }
          >
            Update
          </Button>
        </div>
      </div>
    </Modal>
  );
}