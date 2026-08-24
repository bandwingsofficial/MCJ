"use client";

import { Modal } from "@/src/shared/components/ui/model";

import { CreateTrainerForm } from "./create-trainer-form";

import { useCreateTrainer } from "@/src/features/trainers/hooks/use-create-trainer";

import type {
  CreateTrainerFormValues,
} from "@/src/features/trainers/schemas/trainer.schema";

import type {
  CreateTrainerRequest,
} from "@/src/features/trainers/types/trainer.types";
import { formatJoinedAtForApi } from "@/src/features/trainers/utils/trainer-date.util";

interface CreateTrainerModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function toCreatePayload(
  values: CreateTrainerFormValues
): CreateTrainerRequest {
  return {
    firstName: values.firstName.trim(),
    lastName: values.lastName?.trim()
      ? values.lastName.trim()
      : undefined,
    email: values.email?.trim()
      ? values.email.trim()
      : undefined,
    phone: values.phone?.trim()
      ? values.phone.trim()
      : undefined,
    gender: values.gender,
    bio: values.bio?.trim() ? values.bio.trim() : undefined,
    qualification: values.qualification?.trim()
      ? values.qualification.trim()
      : undefined,
    experienceYears: values.experienceYears,
    specialization: values.specialization?.trim()
      ? values.specialization.trim()
      : undefined,
    skills: values.skills,
    employeeCode: values.employeeCode?.trim()
      ? values.employeeCode.trim()
      : undefined,
    trainerType: values.trainerType,
    linkedInUrl: values.linkedInUrl?.trim()
      ? values.linkedInUrl.trim()
      : undefined,
    youtubeUrl: values.youtubeUrl?.trim()
      ? values.youtubeUrl.trim()
      : undefined,
    instagramUrl: values.instagramUrl?.trim()
      ? values.instagramUrl.trim()
      : undefined,
    isFeatured: values.isFeatured,
    joinedAt: formatJoinedAtForApi(values.joinedAt),
  };
}

export function CreateTrainerModal({
  open,
  onClose,
  onSuccess,
}: CreateTrainerModalProps) {
  const { createTrainer, isPending } = useCreateTrainer();

  const handleSubmit = async (
    values: CreateTrainerFormValues,
    image: File | null
  ) => {
    const success = await createTrainer(
      toCreatePayload(values),
      image
    );

    if (success) {
      onSuccess();
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      title="Create Trainer"
      onClose={onClose}
      bodyClassName="overflow-y-auto bg-white px-6 py-5"
    >
      <CreateTrainerForm
        key={open ? "create-trainer-open" : "create-trainer-closed"}
        submitLabel="Create Trainer"
        isSubmitting={isPending}
        onSubmit={handleSubmit}
      />
    </Modal>
  );
}
