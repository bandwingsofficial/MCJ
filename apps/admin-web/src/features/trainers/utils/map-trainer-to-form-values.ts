import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

import { toDateInputValue } from "@/src/features/trainers/utils/trainer-date.util";

import type { CreateTrainerFormValues } from "@/src/features/trainers/schemas/trainer.schema";

export function mapTrainerToFormValues(
  trainer: TrainerDetails
): CreateTrainerFormValues {
  return {
    firstName: trainer.firstName,
    lastName: trainer.lastName ?? "",
    email: trainer.email ?? "",
    phone: trainer.phone ?? "",
    gender: trainer.gender ?? "MALE",
    bio: trainer.bio ?? "",
    qualification: trainer.qualification ?? "",
    specialization: trainer.specialization ?? "",
    skills: trainer.skills ?? [],
    employeeCode: trainer.employeeCode ?? "",
    trainerType: trainer.trainerType,
    isFeatured: trainer.isFeatured,
    experienceYears: trainer.experienceYears ?? 0,
    joinedAt: toDateInputValue(trainer.joinedAt),
    linkedInUrl: trainer.linkedInUrl ?? "",
    youtubeUrl: trainer.youtubeUrl ?? "",
    instagramUrl: trainer.instagramUrl ?? "",
    profileImageFileId: trainer.profileImageFileId ?? undefined,
  };
}
