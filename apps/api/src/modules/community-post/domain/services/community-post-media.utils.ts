import { CommunityPostType } from '../enums/community-post-type.enum';
import type { CommunityPostMedia } from '../entities/community-post-media.entity';

export function deriveCommunityPostType(
  mediaItems: Array<Pick<CommunityPostMedia, 'mediaType'>>,
): CommunityPostType {
  const hasImage = mediaItems.some(
    (item) => item.mediaType === CommunityPostType.IMAGE,
  );

  return hasImage ? CommunityPostType.IMAGE : CommunityPostType.VIDEO;
}

export function syncCommunityPostLegacyMediaFields(
  mediaItems: CommunityPostMedia[],
): {
  primaryMediaFileId: string | null;
  mediaFileId: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
} {
  const sortedItems = [...mediaItems].sort(
    (left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0),
  );
  const primaryImage =
    sortedItems.find(
      (item) =>
        item.isPrimary && item.mediaType === CommunityPostType.IMAGE,
    ) ??
    sortedItems.find((item) => item.mediaType === CommunityPostType.IMAGE);
  const firstVideo = sortedItems.find(
    (item) => item.mediaType === CommunityPostType.VIDEO,
  );

  if (primaryImage) {
    return {
      primaryMediaFileId: primaryImage.fileId,
      mediaFileId: primaryImage.fileId,
      mediaUrl: primaryImage.url,
      thumbnailUrl: primaryImage.url,
    };
  }

  if (firstVideo) {
    return {
      primaryMediaFileId: null,
      mediaFileId: firstVideo.fileId,
      mediaUrl: firstVideo.url,
      thumbnailUrl: null,
    };
  }

  return {
    primaryMediaFileId: null,
    mediaFileId: null,
    mediaUrl: null,
    thumbnailUrl: null,
  };
}

export function normalizeCommunityPostMediaPrimaryFlags(
  mediaItems: CommunityPostMedia[],
): CommunityPostMedia[] {
  const primaryImage = mediaItems.find(
    (item) => item.isPrimary && item.mediaType === CommunityPostType.IMAGE,
  );
  const fallbackPrimary =
    primaryImage ??
    mediaItems.find((item) => item.mediaType === CommunityPostType.IMAGE);

  return mediaItems.map((item) => {
    item.isPrimary =
      item.mediaType === CommunityPostType.IMAGE &&
      Boolean(fallbackPrimary && fallbackPrimary.id === item.id);
    return item;
  });
}

export function orderCommunityPostMediaWithPrimaryFirst(
  mediaItems: CommunityPostMedia[],
): CommunityPostMedia[] {
  const normalized = normalizeCommunityPostMediaPrimaryFlags([...mediaItems]);
  const primaryIndex = normalized.findIndex(
    (item) => item.isPrimary && item.mediaType === CommunityPostType.IMAGE,
  );

  if (primaryIndex > 0) {
    const [primary] = normalized.splice(primaryIndex, 1);
    normalized.unshift(primary);
  }

  return normalized.map((item, index) => {
    item.displayOrder = index;
    return item;
  });
}
