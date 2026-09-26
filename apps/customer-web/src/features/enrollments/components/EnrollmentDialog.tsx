"use client";

import { useCallback } from "react";

import { Batch } from "@/src/features/batches/types/batch.types";

import { EnrollmentForm } from "@/src/features/enrollments/components/EnrollmentForm";
import { EnrollmentFormValues } from "@/src/features/enrollments/schemas/enrollment.schema";
import { useEnroll } from "@/src/features/enrollments/hooks/useEnroll";

import type {
  Enrollment,
} from "@/src/features/enrollments/types/enrollment.types";

import { Modal } from "@/src/shared/components/ui/model";
import { appToast } from "@/src/shared/components/ui/toast";

function resolveBatchTimingId(batch: Batch | undefined): string | null {
  const timings = batch?.timings ?? [];
  if (!timings.length) {
    return null;
  }

  const activeTiming = timings.find((timing) => timing.isActive);
  return activeTiming?.id ?? timings[0]?.id ?? null;
}

interface EnrollmentDialogProps {
  open: boolean;

  batches: Batch[];

  isLoading: boolean;

  batchError: string | null;

  onRetry: () => void;

  onClose: () => void;

  onSuccess?: (
    enrollment: Enrollment,
  ) => void;
}

export function EnrollmentDialog({
  open,
  batches,
  isLoading,
  batchError,
  onRetry,
  onClose,
  onSuccess,
}: EnrollmentDialogProps) {
  const {
    createEnrollment,
    isSubmitting,
    error,
    clearError,
  } = useEnroll();

  const handleClose =
    useCallback(() => {
      clearError();
      onClose();
    }, [
      clearError,
      onClose,
    ]);

  const handleSubmit =
    useCallback(
      async (
        values: EnrollmentFormValues,
      ) => {
        const batch = batches.find(
          (item) => item.id === values.batchId,
        );
        const batchTimingId = resolveBatchTimingId(batch);

        if (!batchTimingId) {
          appToast.error(
            "No batch timing is available for the selected batch.",
          );
          return;
        }

        const enrollment =
          await createEnrollment({
            batchId: values.batchId,
            batchTimingId,
          });

        if (!enrollment) {
          return;
        }

        appToast.success(
          "Enrollment created successfully.",
        );

        onSuccess?.(
          enrollment,
        );

        handleClose();
      },
      [
        batches,
        createEnrollment,
        handleClose,
        onSuccess,
      ],
    );

  return (
    <Modal
      open={open}
      title="Enroll Course"
      onClose={
        handleClose
      }
    >
      <EnrollmentForm
        batches={batches}
        loading={
          isSubmitting
        }
        batchLoading={
          isLoading
        }
        batchError={
          batchError
        }
        submitError={
          error
        }
        onRetry={
          onRetry
        }
        onSubmit={
          handleSubmit
        }
      />
    </Modal>
  );
}