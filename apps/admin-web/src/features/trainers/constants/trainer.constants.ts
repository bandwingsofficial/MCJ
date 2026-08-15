import type {
  TrainerGender,
  TrainerStatus,
  TrainerType,
} from "@/src/features/trainers/types/trainer.types";

export const TRAINER_GENDERS = [
  "MALE",
  "FEMALE",
  "OTHER",
] as const satisfies readonly TrainerGender[];

export const TRAINER_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "VISITING",
  "GUEST",
  "ONLINE",
] as const satisfies readonly TrainerType[];

export const TRAINER_STATUSES = [
  "ACTIVE",
  "INACTIVE",
] as const satisfies readonly TrainerStatus[];

export const DEFAULT_TRAINER_PAGE_SIZE = 20;
