import { z } from "zod";

import {
  CAPTION_MAX_CHARS,
  DEFAULT_COMMUNITY_AUTHOR_LABEL,
  MAX_LOCATION_LENGTH,
} from "@/src/features/community/constants/community.constants";

export const communitySchema = z.object({
  type: z.enum(["IMAGE", "VIDEO"]),
  caption: z
    .string()
    .trim()
    .min(1, "Caption is required")
    .max(
      CAPTION_MAX_CHARS,
      `Caption cannot exceed ${CAPTION_MAX_CHARS} characters`,
    ),
  authorName: z
    .string()
    .trim()
    .min(1, "Community name is required")
    .max(120, "Community name cannot exceed 120 characters"),
  hashtags: z.array(z.string().trim().min(1)),
  mentions: z.array(z.string().trim().min(1)),
  location: z
    .string()
    .trim()
    .max(
      MAX_LOCATION_LENGTH,
      `Location cannot exceed ${MAX_LOCATION_LENGTH} characters`,
    )
    .optional()
    .or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]),
});

export type CommunityFormValues = z.infer<typeof communitySchema>;

export const defaultCommunityFormValues: CommunityFormValues = {
  type: "IMAGE",
  caption: "",
  authorName: DEFAULT_COMMUNITY_AUTHOR_LABEL,
  hashtags: [],
  mentions: [],
  location: "",
  status: "DRAFT",
};

export function truncateToMaxChars(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  return value.slice(0, maxChars);
}
