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

    lastName: z.string().optional().or(z.literal("")),

    email: z
      .string()
      .email(
        "Enter valid email address"
      )
      .optional()
      .or(z.literal("")),

    phone: z
      .string()
      .regex(
        phoneRegex,
        "Enter valid mobile number"
      )
      .optional()
      .or(z.literal("")),

    gender: z
      .enum(TRAINER_GENDERS)
      .optional(),

    bio: z.string().optional().or(z.literal("")),

    qualification:
      z.string().optional().or(z.literal("")),

    experienceYears: z
      .number()
      .min(0)
      .optional(),

    specialization:
      z.string().optional().or(z.literal("")),

    skills: z
      .array(z.string())
      .default([]),

    employeeCode:
      z.string().optional().or(z.literal("")),

    trainerType: z.enum(
      TRAINER_TYPES
    ),

    linkedInUrl: z
      .string()
      .url()
      .optional()
      .or(z.literal("")),

    youtubeUrl: z
      .string()
      .url()
      .optional()
      .or(z.literal("")),

    instagramUrl: z
      .string()
      .url()
      .optional()
      .or(z.literal("")),

    branchId: z
      .string()
      .uuid()
      .optional()
      .or(z.literal("")),

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
      z.string().optional().or(z.literal("")),

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