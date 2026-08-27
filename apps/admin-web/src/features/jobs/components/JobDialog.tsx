"use client";

import { Button } from "@/src/shared/components/ui/button";
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
    removeImage: boolean,
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
  const isEdit = mode === "edit";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Job" : "Create Job"}
      contentClassName="!max-w-[800px]"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="job-form"
            className="admin-create-btn"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? isEdit
                ? "Saving..."
                : "Creating Job..."
              : isEdit
                ? "Save Changes"
                : "Create Job"}
          </Button>
        </>
      }
    >
      <JobForm
        key={open ? `${mode}-${job?.id ?? "new"}` : "closed"}
        formId="job-form"
        initialData={isEdit ? job : undefined}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
      />
    </Modal>
  );
}
