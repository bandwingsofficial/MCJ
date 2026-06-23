"use client";

import { RadioGroup } from "@/src/shared/components/ui/radio-group";
import { EmptyState } from "@/src/shared/components/ui/empty-state";
import { Loader } from "@/src/shared/components/ui/loader";
import { ErrorState } from "@/src/shared/components/ui/error-state";

import type {
  Batch,
} from "@/src/features/batches/types/batch.types";

interface BatchSelectorProps {
  batches: Batch[];

  value: string;

  isLoading: boolean;

  error: string | null;

  onRetry: () => void;

  onChange: (
    batchId: string,
  ) => void;
}

export function BatchSelector({
  batches,
  value,
  isLoading,
  error,
  onRetry,
  onChange,
}: BatchSelectorProps) {
  if (isLoading) {
    return (
      <div className="py-10 flex justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to load batches"
        description={error}
        onRetry={onRetry}
      />
    );
  }

  if (batches.length === 0) {
    return (
      <EmptyState
        title="No batches available"
        description="There are currently no batches available for this course."
      />
    );
  }

  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      options={batches.map((batch) => ({
        value: batch.id,
        label: `${batch.name}
Mode: ${batch.mode}
${batch.startDate} • ${batch.endDate}
${batch.startTime} - ${batch.endTime}
Seats ${batch.enrolledCount} / ${batch.capacity}`,
      }))}
    />
  );
}