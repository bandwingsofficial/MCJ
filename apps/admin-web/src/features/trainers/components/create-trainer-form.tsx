"use client";

import { TrainerForm } from "@/src/features/trainers/components/trainer-form";

import type { CreateTrainerFormValues } from "@/src/features/trainers/schemas/trainer.schema";

interface CreateTrainerFormProps {
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (
    values: CreateTrainerFormValues,
    image: File | null,
    removeImage?: boolean,
  ) => Promise<void>;
}

export function CreateTrainerForm({
  isSubmitting,
  submitLabel,
  onSubmit,
}: CreateTrainerFormProps) {
  return (
    <TrainerForm
      mode="create"
      isSubmitting={isSubmitting}
      submitLabel={submitLabel}
      onSubmit={onSubmit}
    />
  );
}
