"use client";

import {
  AssignBatchCreateForm,
} from "@/src/features/batches/components/assign-batch-create-form";
import {
  AssignBatchEditForm,
  type AssignBatchEditFormHandle,
} from "@/src/features/batches/components/assign-batch-edit-form";
import type { Batch } from "@/src/features/batches/types/batch.types";
import type { AssignBatchFormSubmitPayload } from "@/src/features/batches/utils/assign-batch-form.utils";
import { forwardRef, type Ref } from "react";

export interface AssignBatchFormHandle {
  submit: () => void;
}

export interface AssignBatchFormProps {
  mode: "create" | "edit";
  open?: boolean;
  batch?: Batch | null;
  batchLoading?: boolean;
  isSubmitting?: boolean;
  onCancel?: () => void;
  onSubmit: (payload: AssignBatchFormSubmitPayload) => Promise<void>;
  idPrefix?: string;
}

export const AssignBatchForm = forwardRef<
  AssignBatchFormHandle,
  AssignBatchFormProps
>(function AssignBatchForm(
  {
    mode,
    open = true,
    batch = null,
    batchLoading = false,
    isSubmitting = false,
    onCancel,
    onSubmit,
    idPrefix = "assign",
  },
  ref,
) {
  const isEdit = mode === "edit";

  if (!isEdit) {
    return (
      <AssignBatchCreateForm
        open={open}
        idPrefix={idPrefix}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onSubmit={onSubmit}
      />
    );
  }

  return (
    <AssignBatchEditForm
      ref={ref as Ref<AssignBatchEditFormHandle>}
      open={open}
      batch={batch}
      batchLoading={batchLoading}
      idPrefix={idPrefix}
      onSubmit={onSubmit}
    />
  );
});
