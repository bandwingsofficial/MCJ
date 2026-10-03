export const STUDENT_PROFILE_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/gif";

export const STUDENT_PROFILE_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

const ALLOWED_TYPES = STUDENT_PROFILE_IMAGE_ACCEPT.split(",");

export function validateStudentProfileImage(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Only JPEG, PNG, WebP, or GIF images are allowed.";
  }

  if (file.size > STUDENT_PROFILE_IMAGE_MAX_BYTES) {
    return "Image must be 5MB or smaller.";
  }

  return null;
}
