import type { TrainerDetails } from "@/src/features/trainers/types/trainer.types";

import { toDateInputValue } from "@/src/features/trainers/utils/trainer-date.util";
import {
  normalizeGender,
  normalizePhoneForIndianForm,
  normalizeTrainerType,
} from "@/src/features/trainers/utils/trainer-form-normalize.utils";

import type { CreateTrainerFormValues } from "@/src/features/trainers/schemas/trainer.schema";

export function mapTrainerToFormValues(
  trainer: TrainerDetails,
): CreateTrainerFormValues {
  return {
    firstName: trainer.firstName ?? "",
    lastName: trainer.lastName ?? "",
    email: trainer.email ?? "",
    phone: normalizePhoneForIndianForm(trainer.phone),
    gender: normalizeGender(trainer.gender),
    bio: trainer.bio ?? "",
    qualification: trainer.qualification ?? "",
    specialization: trainer.specialization ?? "",
    skills: trainer.skills ?? [],
    employeeCode: trainer.employeeCode ?? "",
    trainerType: normalizeTrainerType(trainer.trainerType),
    // The field is registered with `valueAsNumber`, which represents an empty
    // input as NaN. Using NaN (not undefined) makes react-hook-form clear the
    // DOM input on reset instead of keeping a stale value; the schema
    // preprocess maps NaN back to "not provided".
    experienceYears: trainer.experienceYears ?? Number.NaN,
    joinedAt: toDateInputValue(trainer.joinedAt),
    linkedInUrl: trainer.linkedInUrl ?? "",
    youtubeUrl: trainer.youtubeUrl ?? "",
    instagramUrl: trainer.instagramUrl ?? "",
    profileImageFileId: trainer.profileImageFileId ?? undefined,
  };
}
