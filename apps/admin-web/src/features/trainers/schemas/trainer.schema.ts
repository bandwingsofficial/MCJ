import { z } from "zod";

import {
  TRAINER_GENDERS,
  TRAINER_TYPES,
} from "@/src/features/trainers/constants/trainer.constants";

const phoneRegex =
  /^[6-9]\d{9}$/;

export const createTrainerSchema =
  z.object({
    firstName: z
      .string()
      .trim()
      .min(
        1,
        "First name is required"
      )
      .max(
        100,
        "Maximum 100 characters allowed"
      ),

    lastName: z.string().optional(),

    email: z
      .string()
      .email(
        "Enter valid email address"
      )
      .optional(),

    phone: z
      .string()
      .regex(
        phoneRegex,
        "Enter valid mobile number"
      )
      .optional(),

    gender: z
      .enum(TRAINER_GENDERS)
      .optional(),

    bio: z.string().optional(),

    qualification:
      z.string().optional(),

    experienceYears: z
      .number()
      .min(0)
      .optional(),

    specialization:
      z.string().optional(),

    skills: z
      .array(z.string())
      .default([]),

    employeeCode:
      z.string().optional(),

    trainerType: z.enum(
      TRAINER_TYPES
    ),

    linkedInUrl: z
      .string()
      .url()
      .optional(),

    youtubeUrl: z
      .string()
      .url()
      .optional(),

    instagramUrl: z
      .string()
      .url()
      .optional(),

    branchId: z
      .string()
      .uuid()
      .optional(),

    averageRating: z
      .number()
      .min(0)
      .max(5)
      .optional(),

    totalReviews: z
      .number()
      .min(0)
      .optional(),

    isFeatured:
      z.boolean(),

    joinedAt:
      z.string().optional(),

    courseIds: z
      .array(
        z.string().uuid()
      )
      .default([]),
  });

export const updateTrainerSchema =
  createTrainerSchema.partial();

export type CreateTrainerFormValues =
  z.infer<
    typeof createTrainerSchema
  >;

export type UpdateTrainerFormValues =
  z.infer<
    typeof updateTrainerSchema
  >;