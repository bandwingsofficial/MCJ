"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { JobForm } from "@/src/features/jobs/components/JobForm";

import type {
  CreateJobRequest,
  Job,
} from "@/src/features/jobs/types/job.types";

interface JobDialogProps {
  open: boolean;

  mode: "create" | "edit";

  job?: Job;

  isSubmitting: boolean;

  onClose: () => void;

  onSubmit: (
    values: CreateJobRequest,
    image: File | null,
  ) => Promise<void>;
}

export function JobDialog({
  open,
  mode,
  job,
  isSubmitting,
  onClose,
  onSubmit,
}: JobDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        mode === "create"
          ? "Create Job"
          : "Edit Job"
      }
    >
      <JobForm
        initialData={job}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}