import { z } from "zod";

import {
  CAPTION_MAX_CHARS,
  DEFAULT_COMMUNITY_AUTHOR_LABEL,
  MAX_LOCATION_LENGTH,
} from "@/src/features/community/constants/community.constants";

export const communitySchema = z.object({
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
  ctaEnabled: z.boolean(),
  ctaButtonName: z.string().trim().optional(),
  ctaButtonLink: z.string().trim().optional(),
}).superRefine((values, ctx) => {
  if (!values.ctaEnabled) {
    return;
  }

  if (!values.ctaButtonName?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ctaButtonName"],
      message: "Button name is required when Add Button is enabled",
    });
  }

  const link = values.ctaButtonLink?.trim();
  if (!link) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ctaButtonLink"],
      message: "Button link is required when Add Button is enabled",
    });
    return;
  }

  try {
    const parsed = new URL(link);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("invalid protocol");
    }
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["ctaButtonLink"],
      message: "Enter a valid URL starting with http:// or https://",
    });
  }
});

export type CommunityFormValues = z.infer<typeof communitySchema>;

export const defaultCommunityFormValues: CommunityFormValues = {
  caption: "",
  authorName: DEFAULT_COMMUNITY_AUTHOR_LABEL,
  hashtags: [],
  location: "",
  status: "DRAFT",
  ctaEnabled: false,
  ctaButtonName: "",
  ctaButtonLink: "",
};

export function truncateToMaxChars(value: string, maxChars: number): string {
  if (value.length <= maxChars) {
    return value;
  }

  return value.slice(0, maxChars);
}
