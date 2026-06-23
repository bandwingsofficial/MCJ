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
        const enrollment =
          await createEnrollment({
            batchId:
              values.batchId,
            remarks:
              values.remarks,
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