import {
  TRAINER_GENDERS,
  TRAINER_TYPES,
} from "@/src/features/trainers/constants/trainer.constants";
import type {
  TrainerGender,
  TrainerType,
} from "@/src/features/trainers/types/trainer.types";

/** Strip country code / formatting so Indian 10-digit validation passes on edit. */
export function normalizePhoneForIndianForm(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const digits = String(value).replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }

  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }

  if (digits.length > 10) {
    return digits.slice(-10);
  }

  return digits;
}

export function normalizeGender(value: unknown): TrainerGender {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if ((TRAINER_GENDERS as readonly string[]).includes(normalized)) {
    return normalized as TrainerGender;
  }

  return "MALE";
}

export function normalizeTrainerType(value: unknown): TrainerType {
  const normalized = String(value ?? "")
    .trim()
    .toUpperCase();

  if ((TRAINER_TYPES as readonly string[]).includes(normalized)) {
    return normalized as TrainerType;
  }

  return "FULL_TIME";
}
