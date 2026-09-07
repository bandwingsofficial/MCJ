"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/src/shared/components/ui/button";
import { Input } from "@/src/shared/components/ui/input";
import { Label } from "@/src/shared/components/ui/label";
import { appToast } from "@/src/shared/components/ui/toast";
import { getErrorMessage } from "@/src/core/utils/get-error-message";

import { BatchManageSection } from "@/src/features/batches/components/manage/batch-manage-section";
import { batchService } from "@/src/features/batches/services/batch.service";
import type { BatchTiming } from "@/src/features/batches/types/batch.types";

const capacitySchema = z.object({
  capacity: z
    .number({ invalid_type_error: "Capacity is required" })
    .int("Capacity must be a whole number")
    .min(1, "Capacity must be at least 1"),
});

type CapacityFormValues = z.infer<typeof capacitySchema>;

interface Props {
  batchId: string;
  timing: BatchTiming;
  onUpdated: () => void;
}

export function BatchTimingCapacityForm({
  batchId,
  timing,
  onUpdated,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CapacityFormValues>({
    resolver: zodResolver(capacitySchema),
    defaultValues: {
      capacity: timing.capacity,
    },
  });

  useEffect(() => {
    reset({ capacity: timing.capacity });
  }, [reset, timing.capacity, timing.id]);

  const onSubmit = async (values: CapacityFormValues) => {
    setIsSubmitting(true);
    try {
      await batchService.updateBatchTiming(batchId, timing.id, {
        capacity: values.capacity,
      });
      appToast.success("Batch timing capacity updated");
      onUpdated();
    } catch (error) {
      appToast.error(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <BatchManageSection
      title="Edit Capacity"
      description="Seat capacity for this batch timing instance."
    >
      <form className="max-w-sm space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <Label htmlFor="timing-capacity">Capacity</Label>
          <Input
            id="timing-capacity"
            type="number"
            min={1}
            step={1}
            {...register("capacity", { valueAsNumber: true })}
          />
          {errors.capacity ? (
            <p className="text-sm text-red-600">{errors.capacity.message}</p>
          ) : null}
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={isSubmitting}>
            Save Capacity
          </Button>
        </div>
      </form>
    </BatchManageSection>
  );
}
