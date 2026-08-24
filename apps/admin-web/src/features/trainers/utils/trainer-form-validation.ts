export const TRAINER_IMAGE_ACCEPT = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const TRAINER_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

export const TRAINER_CHAR_LIMITS = {
  firstName: 100,
} as const;

export function validateTrainerImageFile(file: File): string | null {
  if (
    !TRAINER_IMAGE_ACCEPT.includes(
      file.type as (typeof TRAINER_IMAGE_ACCEPT)[number],
    )
  ) {
    return "Please upload a valid image (PNG, JPG, or WEBP).";
  }

  if (file.size > TRAINER_IMAGE_MAX_BYTES) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}
