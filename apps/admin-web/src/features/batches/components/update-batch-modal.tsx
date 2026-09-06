"use client";

import { useRef, useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { Button } from "@/src/shared/components/ui/button";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import {
  AssignBatchForm,
  type AssignBatchFormHandle,
} from "@/src/features/batches/components/assign-batch-form";
import { useBatch } from "@/src/features/batches/hooks/useBatch";
import { useUpdateBatch } from "@/src/features/batches/hooks/useUpdateBatch";
import type { BatchListItem } from "@/src/features/batches/types/batch.types";
import { toUpdateBatchRequestFromAssignForm } from "@/src/features/batches/utils/assign-batch-form.utils";

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
  const formRef = useRef<AssignBatchFormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const { updateBatch, isLoading } = useUpdateBatch();
  const { batch: loadedBatch, isLoading: loadingBatch } = useBatch(
    open && batch ? batch.id : "",
  );
  const resolvedBatch = loadedBatch ?? batch;

  return (
    <Modal
      open={open}
      title="Edit Batch"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
      bodyClassName="!py-4"
      footer={
        batch && open ? (
          <>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              loading={isLoading}
              disabled={!canSubmit || isLoading || !resolvedBatch}
              onClick={() => {
                formRef.current?.submit();
              }}
            >
              Update Batch
            </Button>
          </>
        ) : null
      }
    >
      {batch && open ? (
        <AssignBatchForm
          ref={formRef}
          mode="edit"
          open={open}
          batch={resolvedBatch}
          batchLoading={loadingBatch && !loadedBatch}
          idPrefix="edit"
          onCanSubmitChange={setCanSubmit}
          onSubmit={async (payload) => {
            if (!resolvedBatch) {
              return;
            }

            try {
              await updateBatch(
                resolvedBatch.id,
                toUpdateBatchRequestFromAssignForm(payload, resolvedBatch),
              );
              appToast.success("Batch updated successfully");
              await onSuccess();
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
