import { randomUUID } from 'crypto';

import { UploadDomainService } from '@modules/uploads/domain/services/upload-domain.service';

import {
  CommunityPostMedia,
  type CommunityPostMediaInput,
} from '../../domain/entities/community-post-media.entity';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';
import {
  deriveCommunityPostType,
  normalizeCommunityPostMediaPrimaryFlags,
  syncCommunityPostLegacyMediaFields,
} from '../../domain/services/community-post-media.utils';

const COMMUNITY_UPLOAD_FOLDER = 'community';
const COMMUNITY_GALLERY_SUBFOLDER = 'gallery';

export interface ResolvedCommunityPostMediaSync {
  mediaItems: CommunityPostMedia[];
  type: CommunityPostType;
  primaryMediaFileId: string | null;
  mediaFileId: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
}

export async function resolveCommunityPostMediaCollection(params: {
  postId: string;
  mediaInputs: CommunityPostMediaInput[];
  existingMedia?: CommunityPostMedia[];
  uploadDomainService: UploadDomainService;
  updatedBy?: string | null;
}): Promise<ResolvedCommunityPostMediaSync> {
  const existingMedia = params.existingMedia ?? [];
  const nextMedia: CommunityPostMedia[] = [];

  for (const [index, mediaInput] of params.mediaInputs.entries()) {
    const retained = existingMedia.find(
      (item) => item.id === mediaInput.id || item.fileId === mediaInput.fileId,
    );

    if (retained && retained.fileId === mediaInput.fileId) {
      nextMedia.push(
        CommunityPostMedia.create({
          id: retained.id,
          postId: params.postId,
          fileId: retained.fileId,
          mediaType: mediaInput.mediaType,
          displayOrder: mediaInput.displayOrder ?? index,
          isPrimary: mediaInput.isPrimary ?? false,
          url: retained.url,
          mimeType: retained.mimeType,
        }),
      );
      continue;
    }

    const slotMedia = mediaInput.id
      ? existingMedia.find((item) => item.id === mediaInput.id)
      : existingMedia[index];
    const mediaId = slotMedia?.id ?? mediaInput.id ?? randomUUID();
    const previousUploadId = slotMedia?.fileId ?? null;

    const upload = await params.uploadDomainService.attachOrReplaceSlot({
      uploadId: mediaInput.fileId,
      folder: COMMUNITY_UPLOAD_FOLDER,
      entityId: params.postId,
      subFolder: COMMUNITY_GALLERY_SUBFOLDER,
      slotFileName: mediaId,
      previousUploadId,
      updatedBy: params.updatedBy,
    });

    nextMedia.push(
      CommunityPostMedia.create({
        id: mediaId,
        postId: params.postId,
        fileId: upload.id,
        mediaType: mediaInput.mediaType,
        displayOrder: mediaInput.displayOrder ?? index,
        isPrimary: mediaInput.isPrimary ?? false,
        url: upload.url,
        mimeType: upload.mimeType.getValue(),
      }),
    );
  }

  const normalizedMedia = normalizeCommunityPostMediaPrimaryFlags(nextMedia);
  const legacyFields = syncCommunityPostLegacyMediaFields(normalizedMedia);

  return {
    mediaItems: normalizedMedia,
    type: deriveCommunityPostType(normalizedMedia),
    ...legacyFields,
  };
}

export function collectCommunityPostMediaFileIds(
  mediaItems: CommunityPostMedia[],
): string[] {
  return mediaItems.map((item) => item.fileId).filter(Boolean);
}
