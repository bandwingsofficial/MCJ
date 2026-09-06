"use client";

import { useState } from "react";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchForm } from "@/src/features/batches/components/BatchForm";
import { CreateBatchesFromTemplatesForm } from "@/src/features/batches/components/create-batches-from-templates-form";
import { useCreateBatch } from "@/src/features/batches/hooks/useCreateBatch";
import type { BatchFormValues } from "@/src/features/batches/schemas/batch.schema";
import { toCreateBatchRequest } from "@/src/features/batches/utils/batch-form.utils";

interface CreateBatchModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

type CreateMethod = "template" | "custom";

export function CreateBatchModal({
  open,
  onClose,
  onSuccess,
}: CreateBatchModalProps) {
  const { createBatch, isLoading } = useCreateBatch();
  const [method, setMethod] = useState<CreateMethod>("template");

  const handleCustomSubmit = async (values: BatchFormValues) => {
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
      onClose={() => {
        setMethod("template");
        onClose();
      }}
      contentClassName="!flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-3xl flex-col !overflow-hidden"
    >
      <div className="mb-5 flex gap-2 rounded-xl border border-slate-200 bg-slate-50 p-1">
        <button
          type="button"
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            method === "template"
              ? "bg-white text-[#102A56] shadow-sm"
              : "text-slate-600 hover:text-[#102A56]"
          }`}
          onClick={() => setMethod("template")}
        >
          From Schedule Template
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
            method === "custom"
              ? "bg-white text-[#102A56] shadow-sm"
              : "text-slate-600 hover:text-[#102A56]"
          }`}
          onClick={() => setMethod("custom")}
        >
          Custom Batch
        </button>
      </div>

      {method === "template" ? (
        <CreateBatchesFromTemplatesForm
          key={open ? "from-template-open" : "from-template-closed"}
          onCancel={() => {
            setMethod("template");
            onClose();
          }}
          onSuccess={async () => {
            await onSuccess();
            setMethod("template");
            onClose();
          }}
        />
      ) : (
        <BatchForm
          key={open ? "create-batch-open" : "create-batch-closed"}
          isEdit={false}
          isSubmitting={isLoading}
          submitLabel="Create Batch"
          loadingLabel="Creating Batch..."
          onSubmit={async (values) => {
            try {
              await handleCustomSubmit(values);
            } catch (error) {
              appToast.error(getErrorMessage(error));
            }
          }}
          onCancel={() => {
            setMethod("template");
            onClose();
          }}
        />
      )}
    </Modal>
  );
}
