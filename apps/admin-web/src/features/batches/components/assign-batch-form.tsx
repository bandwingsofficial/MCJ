"use client";

import { forwardRef, type Ref } from "react";

import {
  AssignBatchCreateForm,
  type AssignBatchCreateFormHandle,
} from "@/src/features/batches/components/assign-batch-create-form";
import {
  AssignBatchEditForm,
  type AssignBatchEditFormHandle,
} from "@/src/features/batches/components/assign-batch-edit-form";
import type { Batch } from "@/src/features/batches/types/batch.types";
import type { AssignBatchFormSubmitPayload } from "@/src/features/batches/utils/assign-batch-form.utils";

export interface AssignBatchFormHandle {
  submit: () => void;
}

export interface AssignBatchFormProps {
  mode: "create" | "edit";
  open?: boolean;
  batch?: Batch | null;
  batchLoading?: boolean;
  onCanSubmitChange?: (canSubmit: boolean) => void;
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
    onCanSubmitChange,
    onSubmit,
    idPrefix = "assign",
  },
  ref,
) {
  const isEdit = mode === "edit";

  if (!isEdit) {
    return (
      <AssignBatchCreateForm
        ref={ref as Ref<AssignBatchCreateFormHandle>}
        open={open}
        idPrefix={idPrefix}
        onCanSubmitChange={onCanSubmitChange}
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
      onCanSubmitChange={onCanSubmitChange}
      onSubmit={onSubmit}
    />
  );
});
