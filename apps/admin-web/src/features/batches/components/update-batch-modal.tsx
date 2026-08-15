"use client";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchForm } from "@/src/features/batches/components/BatchForm";
import { useUpdateBatch } from "@/src/features/batches/hooks/useUpdateBatch";
import type { BatchFormValues } from "@/src/features/batches/schemas/batch.schema";
import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import { batchMapper } from "@/src/features/batches/utils/batch.mapper";
import { toUpdateBatchRequest } from "@/src/features/batches/utils/batch-form.utils";

interface UpdateBatchModalProps {
  open: boolean;
  batch: BatchListItem | null;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function UpdateBatchModal({
  open,
  batch,
  onClose,
  onSuccess,
}: UpdateBatchModalProps) {
  const { updateBatch, isLoading } = useUpdateBatch();

  const handleSubmit = async (values: BatchFormValues) => {
    if (!batch) {
      return;
    }

    await updateBatch(batch.id, toUpdateBatchRequest(values));
    appToast.success("Batch updated successfully");
    await onSuccess();
    onClose();
  };

  const handleError = (error: unknown) => {
    appToast.error(getErrorMessage(error));
  };

  return (
    <Modal
      open={open}
      title="Edit Batch"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      {batch ? (
        <BatchForm
          key={batch.id}
          isEdit
          defaultValues={batchMapper.toForm(batch)}
          isSubmitting={isLoading}
          submitLabel="Update Batch"
          loadingLabel="Updating Batch..."
          onSubmit={async (values) => {
            try {
              await handleSubmit(values);
            } catch (error) {
              handleError(error);
            }
          }}
          onCancel={onClose}
        />
      ) : null}
    </Modal>
  );
}
