// src/features/community/schemas/community.schema.ts

import { z } from "zod";

export const communitySchema = z.object({
  type: z.enum([
    "IMAGE",
    "VIDEO",
  ]),

  caption: z
    .string()
    .trim()
    .min(
      1,
      "Caption is required",
    )
    .max(
      1000,
      "Caption cannot exceed 1000 characters",
    ),

  mediaUrl: z
    .string()
    .trim()
    .url("Please enter a valid media URL"),

  hashtags: z.array(
    z.string().trim().min(1),
  ),

  mentions: z.array(
    z.string().trim().min(1),
  ),

  location: z
    .string()
    .trim()
    .max(
      150,
      "Location cannot exceed 150 characters",
    )
    .optional()
    .or(z.literal("")),

  status: z.enum([
    "DRAFT",
    "PUBLISHED",
    "ARCHIVED",
  ]),
});

export type CommunityFormValues =
  z.infer<
    typeof communitySchema
  >;