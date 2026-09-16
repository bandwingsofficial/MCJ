import { CommunityPostType } from '../enums/community-post-type.enum';

export class CommunityPostMedia {
  constructor(
    public readonly id: string,
    public readonly postId: string,
    public readonly fileId: string,
    public mediaType: CommunityPostType,
    public displayOrder: number | null,
    public isPrimary: boolean,
    public url: string | null = null,
    public mimeType: string | null = null,
    public readonly createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}

  static create(params: {
    id: string;
    postId: string;
    fileId: string;
    mediaType: CommunityPostType;
    displayOrder?: number | null;
    isPrimary?: boolean;
    url?: string | null;
    mimeType?: string | null;
  }): CommunityPostMedia {
    return new CommunityPostMedia(
      params.id,
      params.postId,
      params.fileId,
      params.mediaType,
      params.displayOrder ?? null,
      params.isPrimary ?? false,
      params.url ?? null,
      params.mimeType ?? null,
    );
  }
}

export interface CommunityPostMediaInput {
  id?: string;
  fileId: string;
  mediaType: CommunityPostType;
  displayOrder?: number | null;
  isPrimary?: boolean;
}
