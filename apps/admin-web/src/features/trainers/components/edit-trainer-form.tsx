"use client";

import { TrainerForm } from "@/src/features/trainers/components/trainer-form";

import type { CreateTrainerFormValues } from "@/src/features/trainers/schemas/trainer.schema";
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

interface EditTrainerFormProps {
  trainer: TrainerDetails;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (
    values: CreateTrainerFormValues,
    image: File | null
  ) => Promise<void>;
}

export function EditTrainerForm({
  trainer,
  isSubmitting,
  submitLabel,
  onSubmit,
}: EditTrainerFormProps) {
  return (
    <TrainerForm
      mode="edit"
      trainer={trainer}
      isSubmitting={isSubmitting}
      submitLabel={submitLabel}
      onSubmit={onSubmit}
    />
  );
}
