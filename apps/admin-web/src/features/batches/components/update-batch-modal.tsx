"use client";

import { useMemo, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchForm } from "@/src/features/batches/components/BatchForm";
import { useBatch } from "@/src/features/batches/hooks/useBatch";
import { useUpdateBatch } from "@/src/features/batches/hooks/useUpdateBatch";
import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import {
  batchToFormValues,
  toUpdateBatchRequest,
} from "@/src/features/batches/utils/batch-form.utils";
import { notifyBatchLifecycleChanged } from "@/src/features/batches/utils/batch-lifecycle-sync";

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
  const [formSessionKey, setFormSessionKey] = useState(0);
  const { updateBatch, isLoading } = useUpdateBatch();
  const { batch: loadedBatch, isLoading: loadingBatch } = useBatch(
    open && batch ? batch.id : "",
  );
  const resolvedBatch = loadedBatch ?? batch;

  const defaultValues = useMemo(() => {
    if (!resolvedBatch) {
      return undefined;
    }

    return batchToFormValues(resolvedBatch);
  }, [resolvedBatch]);

  const initialCourse = resolvedBatch?.course
    ? {
        id: resolvedBatch.course.id,
        title: resolvedBatch.course.title,
        code: resolvedBatch.course.code,
      }
    : null;

  return (
    <Modal
      open={open}
      title="Edit Batch"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      {batch && open && defaultValues ? (
        <BatchForm
          key={`edit-${batch.id}-${formSessionKey}`}
          formSessionKey={`edit-${batch.id}-${formSessionKey}`}
          isEdit
          defaultValues={defaultValues}
          initialCourse={initialCourse}
          isSubmitting={isLoading || loadingBatch}
          submitLabel="Save Changes"
          loadingLabel="Saving..."
          onCancel={onClose}
          onSubmit={async (values) => {
            if (!resolvedBatch) {
              return;
            }

            try {
              await updateBatch(
                resolvedBatch.id,
                toUpdateBatchRequest(values),
              );
              appToast.success("Batch updated successfully");
              notifyBatchLifecycleChanged();
              await onSuccess();
              setFormSessionKey((value) => value + 1);
              onClose();
            } catch (error) {
              appToast.error(getErrorMessage(error));
            }
          }}
        />
      ) : null}
    </Modal>
  );
}
