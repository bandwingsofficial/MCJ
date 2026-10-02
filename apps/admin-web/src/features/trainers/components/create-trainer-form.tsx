"use client";

import { TrainerForm } from "@/src/features/trainers/components/trainer-form";

import type { CreateTrainerFormValues } from "@/src/features/trainers/schemas/trainer.schema";

interface CreateTrainerFormProps {
  isSubmitting: boolean;
  onSubmit: (
    values: CreateTrainerFormValues,
    image: File | null,
    removeImage?: boolean,
  ) => Promise<void>;
}

export function CreateTrainerForm({
  isSubmitting,
  onSubmit,
}: CreateTrainerFormProps) {
  return (
    <TrainerForm
      mode="create"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    />
  );
}
