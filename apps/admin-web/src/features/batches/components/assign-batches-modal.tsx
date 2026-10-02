"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { AssignBatchCreateForm } from "@/src/features/batches/components/assign-batch-create-form";
import { batchService } from "@/src/features/batches/services/batch.service";
import { notifyBatchLifecycleChanged } from "@/src/features/batches/utils/batch-lifecycle-sync";

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
};

export function AssignBatchesModal({ open, onClose, onSuccess }: Props) {
  const [submitting, setSubmitting] = useState(false);

  return (
    <Modal
      open={open}
      title="Assign Batches"
      onClose={onClose}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      {open ? (
        <AssignBatchCreateForm
          open={open}
          idPrefix="assign"
          isSubmitting={submitting}
          onCancel={onClose}
          onSubmit={async (payload) => {
            setSubmitting(true);
            try {
              const response = await batchService.createBatchWithTimings({
                courseId: payload.courseId,
                name: payload.name,
                startDate: payload.startDate,
                endDate: payload.endDate,
                templateIds: payload.templateIds,
                modeConfigs: payload.modeConfigs,
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
              notifyBatchLifecycleChanged();
              await onSuccess();
              onClose();
            } catch (error) {
              appToast.error(getErrorMessage(error));
            } finally {
              setSubmitting(false);
            }
          }}
        />
      ) : null}
    </Modal>
  );
}
