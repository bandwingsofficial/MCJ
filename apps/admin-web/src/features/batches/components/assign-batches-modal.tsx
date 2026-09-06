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
import { batchService } from "@/src/features/batches/services/batch.service";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

export function AssignBatchesModal({ open, onClose, onSuccess }: Props) {
  const formRef = useRef<AssignBatchFormHandle>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal
      open={open}
      title="Assign Batches"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
      bodyClassName="!py-4"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            loading={submitting}
            disabled={!canSubmit || submitting}
            onClick={() => {
              formRef.current?.submit();
            }}
          >
            Assign Batches
          </Button>
        </>
      }
    >
      <AssignBatchForm
        ref={formRef}
        mode="create"
        open={open}
        idPrefix="assign"
        onCanSubmitChange={setCanSubmit}
        onSubmit={async (payload) => {
          setSubmitting(true);
          try {
            const response = await batchService.createBatchWithTimings({
              courseId: payload.courseId,
              name: payload.name,
              startDate: payload.startDate,
              endDate: payload.endDate,
              templateIds: payload.templateIds,
              durationValue: payload.durationValue,
              durationType: payload.durationType,
              originalPrice: payload.originalPrice,
              discountedPrice: payload.discountedPrice,
              discountAmount: payload.discountAmount,
              currency: payload.currency,
              isFree: payload.isFree,
            });

            appToast.success(
              response.message || "Batch created successfully",
            );
            await onSuccess();
            onClose();
          } catch (error) {
            appToast.error(getErrorMessage(error));
          } finally {
            setSubmitting(false);
          }
        }}
      />
    </Modal>
  );
}
