"use client";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchTemplateForm } from "@/src/features/batch-templates/components/batch-template-form";
import { batchTemplateService } from "@/src/features/batch-templates/services/batch-template.service";
import type { BatchTemplateFormValues } from "@/src/features/batch-templates/schemas/batch-template.schema";
import type { BatchTemplate } from "@/src/features/batch-templates/types/batch-template.types";

type Props = {
  open: boolean;
  template?: BatchTemplate | null;
  onClose: () => void;
  onSuccess: () => void;
};

export function BatchTemplateFormModal({
  open,
  template,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = Boolean(template);

  const handleSubmit = async (values: BatchTemplateFormValues) => {
    try {
      const payload = {
        name: values.name.trim(),
        mode: values.mode,
        hasFixedTime: values.hasFixedTime,
        daysOfWeek: values.hasFixedTime ? values.daysOfWeek : [],
        startTime: values.hasFixedTime ? values.startTime : null,
        endTime: values.hasFixedTime ? values.endTime : null,
        isActive: values.isActive,
        capacity: values.capacity,
      };

      if (isEdit && template) {
        await batchTemplateService.updateTemplate(template.id, payload);
        appToast.success("Batch timing updated successfully");
      } else {
        await batchTemplateService.createTemplate(payload);
        appToast.success("Batch timing created successfully");
      }

      onSuccess();
      onClose();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    }
  };

  return (
    <Modal
      open={open}
      title={isEdit ? "Edit Batch Timing" : "Add Batch Timing"}
      onClose={onClose}
      contentClassName="!max-w-xl"
    >
      <BatchTemplateForm
        key={
          open
            ? `timing-${template?.id ?? "new"}`
            : "timing-closed"
        }
        initial={template}
        submitLabel={isEdit ? "Save Changes" : "Create Batch Timing"}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
}
