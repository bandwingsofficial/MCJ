"use client";

import { TrainerForm } from "@/src/features/trainers/components/trainer-form";

import type { CreateTrainerFormValues } from "@/src/features/trainers/schemas/trainer.schema";
import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

interface EditTrainerFormProps {
  trainer: TrainerDetails;
  isSubmitting: boolean;
  onSubmit: (
    values: CreateTrainerFormValues,
    image: File | null,
    removeImage?: boolean,
  ) => Promise<void>;
}

export function EditTrainerForm({
  trainer,
  isSubmitting,
  onSubmit,
}: EditTrainerFormProps) {
  return (
    <TrainerForm
      mode="edit"
      trainer={trainer}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
    />
  );
}
