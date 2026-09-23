import type { CommunityPostType } from "@/src/features/community/types/community.types";

export interface CommunityMediaFormItem {
  clientId: string;
  id?: string;
  fileId?: string;
  file?: File | null;
  mediaType: CommunityPostType;
  previewUrl?: string | null;
  url?: string | null;
  mimeType?: string | null;
  displayOrder: number;
  isPrimary: boolean;
  uploadError?: string | null;
  isUploading?: boolean;
}

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const ACCEPTED_VIDEO_TYPES = [
  "video/mp4",
  "video/webm",
  "video/quicktime",
] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024;

export function inferCommunityMediaType(file: File): CommunityPostType {
  return file.type.startsWith("video/") ? "VIDEO" : "IMAGE";
}

export function validateCommunityMediaFile(file: File): string | null {
  if (ACCEPTED_IMAGE_TYPES.includes(file.type as (typeof ACCEPTED_IMAGE_TYPES)[number])) {
    if (file.size > MAX_IMAGE_BYTES) {
      return "Images must be 10 MB or smaller";
    }

    return null;
  }

  if (ACCEPTED_VIDEO_TYPES.includes(file.type as (typeof ACCEPTED_VIDEO_TYPES)[number])) {
    if (file.size > MAX_VIDEO_BYTES) {
      return "Videos must be 100 MB or smaller";
    }

    return null;
  }

  return "Only PNG, JPG, JPEG, WEBP images or MP4, WEBM, MOV videos are allowed";
}

export function createClientMediaId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `media-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function normalizePrimaryMediaFlags(
  items: CommunityMediaFormItem[],
): CommunityMediaFormItem[] {
  const primaryImage =
    items.find((item) => item.isPrimary && item.mediaType === "IMAGE") ??
    items.find((item) => item.mediaType === "IMAGE");

  return items.map((item) => ({
    ...item,
    isPrimary:
      item.mediaType === "IMAGE" &&
      Boolean(primaryImage && primaryImage.clientId === item.clientId),
  }));
}

export function reorderCommunityMediaItems(
  items: CommunityMediaFormItem[],
): CommunityMediaFormItem[] {
  const withFlags = normalizePrimaryMediaFlags(items);
  const primaryIndex = withFlags.findIndex(
    (item) => item.isPrimary && item.mediaType === "IMAGE",
  );

  let ordered = withFlags;
  if (primaryIndex > 0) {
    ordered = [...withFlags];
    const [primary] = ordered.splice(primaryIndex, 1);
    ordered.unshift(primary);
  }

  return ordered.map((item, index) => ({
    ...item,
    displayOrder: index,
  }));
}

export function deriveCommunityPostTypeFromMedia(
  items: CommunityMediaFormItem[],
): CommunityPostType {
  return items.some((item) => item.mediaType === "IMAGE") ? "IMAGE" : "VIDEO";
}

export function getPrimaryMediaPreviewUrl(
  items: CommunityMediaFormItem[],
): string | null {
  const primaryImage = items.find(
    (item) => item.isPrimary && item.mediaType === "IMAGE",
  );
  const fallbackImage = items.find((item) => item.mediaType === "IMAGE");
  const fallbackVideo = items.find((item) => item.mediaType === "VIDEO");
  const target = primaryImage ?? fallbackImage ?? fallbackVideo ?? null;

  if (!target) {
    return null;
  }

  return target.previewUrl ?? target.url ?? null;
}

export function mapExistingPostMediaToFormItems(
  post: Pick<
    import("@/src/features/community/types/community.types").CommunityPostDetails,
    "media" | "mediaFileId" | "mediaUrl" | "type" | "primaryMediaFileId"
  >,
): CommunityMediaFormItem[] {
  if (post.media?.length) {
    return reorderCommunityMediaItems(
      post.media.map((item, index) => ({
        clientId: item.id,
        id: item.id,
        fileId: item.fileId,
        mediaType: item.mediaType,
        url: item.url,
        mimeType: item.mimeType ?? null,
        previewUrl: item.url,
        displayOrder: item.displayOrder ?? index,
        isPrimary:
          item.isPrimary ||
          (item.mediaType === "IMAGE" &&
            item.fileId === post.primaryMediaFileId),
      })),
    );
  }

  if (!post.mediaFileId || !post.mediaUrl) {
    return [];
  }

  return reorderCommunityMediaItems([
    {
      clientId: post.mediaFileId,
      id: post.mediaFileId,
      fileId: post.mediaFileId,
      mediaType: post.type,
      url: post.mediaUrl,
      previewUrl: post.mediaUrl,
      displayOrder: 0,
      isPrimary:
        post.type === "IMAGE" &&
        (post.primaryMediaFileId === post.mediaFileId ||
          !post.primaryMediaFileId),
    },
  ]);
}

export function buildCommunityMediaPayload(items: CommunityMediaFormItem[]) {
  return reorderCommunityMediaItems(items).map((item, index) => ({
    id: item.id,
    fileId: item.fileId!,
    mediaType: item.mediaType,
    displayOrder: index,
    isPrimary: item.isPrimary,
  }));
}
