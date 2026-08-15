"use client";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchForm } from "@/src/features/batches/components/BatchForm";
import { useCreateBatch } from "@/src/features/batches/hooks/useCreateBatch";
import type { BatchFormValues } from "@/src/features/batches/schemas/batch.schema";
import { toCreateBatchRequest } from "@/src/features/batches/utils/batch-form.utils";

interface CreateBatchModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function CreateBatchModal({
  open,
  onClose,
  onSuccess,
}: CreateBatchModalProps) {
  const { createBatch, isLoading } = useCreateBatch();

  const handleSubmit = async (values: BatchFormValues) => {
    try {
      await createBatch(toCreateBatchRequest(values));
      appToast.success("Batch created successfully");
      await onSuccess();
      onClose();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      title="Create Batch"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      <BatchForm
        key={open ? "create-batch-open" : "create-batch-closed"}
        isEdit={false}
        isSubmitting={isLoading}
        submitLabel="Create Batch"
        loadingLabel="Creating Batch..."
        onSubmit={async (values) => {
          try {
            await handleSubmit(values);
          } catch (error) {
            appToast.error(getErrorMessage(error));
          }
        }}
        onCancel={onClose}
      />
    </Modal>
  );
}
