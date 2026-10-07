export const BANNER_IMAGE_WIDTH = 1920;
export const BANNER_IMAGE_HEIGHT = 750;
export const BANNER_UPLOAD_FOLDER = "banners";
export const BANNER_MAX_GROUPS = 20;
export const BANNER_MAX_IMAGES_PER_GROUP = 20;
export const BANNER_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const BANNER_ALLOWED_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const BANNER_PLACEMENTS = [
  { value: "HOMEPAGE", label: "Homepage" },
] as const;

export type BannerPlacementValue = (typeof BANNER_PLACEMENTS)[number]["value"];

export const BANNER_STATUSES = ["ACTIVE", "INACTIVE"] as const;

export type BannerStatusValue = (typeof BANNER_STATUSES)[number];

export function getBannerPlacementLabel(value: string): string {
  return (
    BANNER_PLACEMENTS.find((item) => item.value === value)?.label ?? value
  );
}

export function isAllowedBannerMimeType(mimeType: string): boolean {
  return (BANNER_ALLOWED_MIME_TYPES as readonly string[]).includes(mimeType);
}

export function getBannerResolutionError(
  width: number | null | undefined,
  height: number | null | undefined,
): string | null {
  if (width === BANNER_IMAGE_WIDTH && height === BANNER_IMAGE_HEIGHT) {
    return null;
  }

  return `Banner images must be ${BANNER_IMAGE_WIDTH} × ${BANNER_IMAGE_HEIGHT} px.`;
}
