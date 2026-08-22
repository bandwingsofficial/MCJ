"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

import {
  enrollmentSchema,
  type EnrollmentFormValues,
} from "@/src/features/enrollments/schemas/enrollment.schema";

import { Button } from "@/src/shared/components/ui/button";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { FormError } from "@/src/shared/components/ui/form-error";
import { Label } from "@/src/shared/components/ui/label";
import { Loader } from "@/src/shared/components/ui/loader";
import { RadioGroup } from "@/src/shared/components/ui/radio-group";
import { Textarea } from "@/src/shared/components/ui/textarea";

interface EnrollmentFormProps {
  batches: Batch[];
  defaultBatchId?: string;
  loading: boolean;

  batchLoading: boolean;

  batchError: string | null;

  submitError?: string | null;

  onRetry: () => void;

  onSubmit: (
    values: EnrollmentFormValues,
  ) => Promise<void>;
}

export function EnrollmentForm({
  batches,
  defaultBatchId,
  loading,
  batchLoading,
  batchError,
  submitError,
  onRetry,
  onSubmit,
}: EnrollmentFormProps) {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentFormValues>({
    resolver: zodResolver(enrollmentSchema),
    defaultValues: {
      batchId: defaultBatchId ?? "",
      remarks: "",
    },
  });

  if (batchLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader />
      </div>
    );
  }

  if (batchError) {
    return (
      <div className="space-y-4">

        <FormError
          message={batchError}
        />

        <Button
          variant="outline"
          onClick={onRetry}
        >
          Retry
        </Button>

      </div>
    );
  }

  if (batches.length === 0) {
    return (
      <EmptyState
        title="No Batches Available"
        description="There are currently no batches available for this course."
      />
    );
  }

  return (
    <form
      onSubmit={handleSubmit(
        onSubmit,
      )}
      className="space-y-6"
    >

      <div>

        <Label required>
          Select Batch
        </Label>

        <Controller
          control={control}
          name="batchId"
          render={({
            field,
          }) => (
            <RadioGroup
              value={
                field.value
              }
              onValueChange={
                field.onChange
              }
              options={batches.map((batch) => ({
                value: batch.id,
                label: [
                  batch.name,
                  batch.code,
                  batch.branch?.branchName,
                  `${batch.startTime}-${batch.endTime}`,
                  `${batch.enrolledCount}/${batch.capacity} seats`,
                ]
                  .filter(Boolean)
                  .join(" · "),
              }))}
            />
          )}
        />

        <FormError
          message={
            errors.batchId
              ?.message
          }
        />

      </div>

      <div>

        <Label>
          Remarks
        </Label>

        <Controller
          control={control}
          name="remarks"
          render={({
            field,
          }) => (
            <Textarea
              {...field}
              placeholder="Enter remarks (optional)"
            />
          )}
        />

        <FormError
          message={
            errors.remarks
              ?.message
          }
        />

      </div>

      <FormError
        message={
          submitError ??
          undefined
        }
      />

      <div className="flex justify-end">

        <Button
          type="submit"
          loading={
            loading
          }
          disabled={
            loading ||
            batches.length === 0
          }
        >
          Enroll Now
        </Button>

      </div>

    </form>
  );
}