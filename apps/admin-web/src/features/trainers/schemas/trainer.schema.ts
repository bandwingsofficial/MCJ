import { z } from "zod";

import {
  TRAINER_GENDERS,
  TRAINER_TYPES,
} from "@/src/features/trainers/constants/trainer.constants";

import {
  countWords,
  MAX_BIO_WORDS,
} from "@/src/features/trainers/utils/word-count.util";

const phoneRegex = /^[6-9]\d{9}$/;

function isOptionalHttpUrl(value: string | undefined): boolean {
  const trimmed = value?.trim() ?? "";

  if (!trimmed) {
    return true;
  }

  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

const optionalUrl = z
  .string()
  .trim()
  .refine(isOptionalHttpUrl, {
    message: "Enter a valid URL",
  });

const optionalEmail = z
  .string()
  .email("Enter valid email address")
  .optional()
  .or(z.literal(""));

const optionalPhone = z
  .string()
  .regex(phoneRegex, "Enter valid mobile number")
  .optional()
  .or(z.literal(""));

export const createTrainerSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "First name is required")
    .max(100, "Maximum 100 characters allowed"),

  lastName: z.string().optional().or(z.literal("")),

  email: optionalEmail,

  phone: optionalPhone,

  profileImageFileId: z.string().optional(),

  employeeCode: z.string().optional(),

  gender: z.enum(TRAINER_GENDERS).optional(),

  bio: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) =>
        countWords(value ?? "") <= MAX_BIO_WORDS,
      {
        message: `Biography must not exceed ${MAX_BIO_WORDS} words`,
      }
    ),

  qualification: z.string().optional().or(z.literal("")),

  experienceYears: z.preprocess(
    (value) => {
      if (
        value === "" ||
        value === null ||
        value === undefined
      ) {
        return undefined;
      }

      if (
        typeof value === "number" &&
        Number.isNaN(value)
      ) {
        return undefined;
      }

      return value;
    },
    z
      .number({
        message: "Enter a valid number of years",
      })
      .min(
        0,
        "Experience must be at least 0 years"
      )
      .optional()
  ),

  specialization: z.string().optional().or(z.literal("")),

  skills: z.array(z.string()).default([]),

  trainerType: z.enum(TRAINER_TYPES),

  linkedInUrl: optionalUrl,

  youtubeUrl: optionalUrl,

  instagramUrl: optionalUrl,

  isFeatured: z.boolean(),

  joinedAt: z
    .string()
    .optional()
    .or(z.literal(""))
    .refine(
      (value) =>
        !value ||
        /^\d{4}-\d{2}-\d{2}$/.test(value),
      {
        message: "Enter a valid date",
      }
    ),
});

export const updateTrainerSchema = createTrainerSchema;

export type CreateTrainerFormValues = z.infer<
  typeof createTrainerSchema
>;

export type UpdateTrainerFormValues = CreateTrainerFormValues;
