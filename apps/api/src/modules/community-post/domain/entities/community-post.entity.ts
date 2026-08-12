import { CommunityPostStatus } from '../enums/community-post-status.enum';
import { CommunityPostType } from '../enums/community-post-type.enum';
import { Caption } from '../value-objects/caption.vo';
import { Hashtag } from '../value-objects/hashtag.vo';
import { Location } from '../value-objects/location.vo';
import { MediaUrl } from '../value-objects/media-url.vo';
import { Mention } from '../value-objects/mention.vo';

export class CommunityPost {
  private constructor(
    public readonly id: string,
    public type: CommunityPostType,
    public caption: Caption,
    public mediaFileId: string | null,
    public mediaUrl: MediaUrl,
    public thumbnailUrl: MediaUrl,
    public hashtags: string[],
    public mentions: string[],
    public location: Location,
    public viewCount: number,
    public likeCount: number,
    public commentCount: number,
    public shareCount: number,
    public status: CommunityPostStatus,
    public isActive: boolean,
    public readonly createdBy: string | null,
    public updatedBy: string | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
    public deletedBy: string | null,
    public readonly createdAt: Date,
    public updatedAt: Date,
  ) {}

  static create(params: CommunityPostCreateParams): CommunityPost {
    return new CommunityPost(
      params.id,
      params.type,
      Caption.create(params.caption),
      params.mediaFileId ?? null,
      MediaUrl.create(params.mediaUrl),
      MediaUrl.create(params.thumbnailUrl),
      Hashtag.createMany(params.hashtags),
      Mention.createMany(params.mentions),
      Location.create(params.location),
      0,
      0,
      0,
      0,
      params.status ?? CommunityPostStatus.DRAFT,
      params.isActive ?? true,
      params.createdBy ?? null,
      null,
      false,
      null,
      null,
      new Date(),
      new Date(),
    );
  }

  static reconstitute(
    params: CommunityPostReconstituteParams,
  ): CommunityPost {
    return new CommunityPost(
      params.id,
      params.type,
      Caption.create(params.caption),
      params.mediaFileId,
      MediaUrl.create(params.mediaUrl),
      MediaUrl.create(params.thumbnailUrl),
      params.hashtags,
      params.mentions,
      Location.create(params.location),
      params.viewCount,
      params.likeCount,
      params.commentCount,
      params.shareCount,
      params.status,
      params.isActive,
      params.createdBy,
      params.updatedBy,
      params.isDeleted,
      params.deletedAt,
      params.deletedBy,
      params.createdAt,
      params.updatedAt,
    );
  }

  update(params: CommunityPostUpdateParams) {
    if (params.type !== undefined) this.type = params.type;
    if (params.caption !== undefined) {
      this.caption = Caption.create(params.caption);
    }
    if (params.mediaFileId !== undefined) {
      this.mediaFileId = params.mediaFileId;
    }
    if (params.mediaUrl !== undefined) {
      this.mediaUrl = MediaUrl.create(params.mediaUrl);
    }
    if (params.thumbnailUrl !== undefined) {
      this.thumbnailUrl = MediaUrl.create(params.thumbnailUrl);
    }
    if (params.hashtags !== undefined) {
      this.hashtags = Hashtag.createMany(params.hashtags);
    }
    if (params.mentions !== undefined) {
      this.mentions = Mention.createMany(params.mentions);
    }
    if (params.location !== undefined) {
      this.location = Location.create(params.location);
    }
    if (params.status !== undefined) this.status = params.status;

    this.updatedBy = params.updatedBy ?? this.updatedBy;
    this.touch();
  }

  activate(updatedBy?: string | null) {
    this.isActive = true;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  deactivate(updatedBy?: string | null) {
    this.isActive = false;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  softDelete(deletedBy?: string | null) {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.deletedBy = deletedBy ?? null;
    this.touch();
  }

  restore(updatedBy?: string | null) {
    this.isDeleted = false;
    this.deletedAt = null;
    this.deletedBy = null;
    this.updatedBy = updatedBy ?? this.updatedBy;
    this.touch();
  }

  isPubliclyVisible(): boolean {
    return (
      !this.isDeleted &&
      this.isActive &&
      this.status === CommunityPostStatus.PUBLISHED
    );
  }

  private touch() {
    this.updatedAt = new Date();
  }
}

export interface CommunityPostCreateParams {
  id: string;
  type: CommunityPostType;
  caption?: string | null;
  mediaFileId?: string | null;
  mediaUrl?: string | null;
  thumbnailUrl?: string | null;
  hashtags?: string[];
  mentions?: string[];
  location?: string | null;
  status?: CommunityPostStatus;
  isActive?: boolean;
  createdBy?: string | null;
}

export interface CommunityPostUpdateParams
  extends Partial<Omit<CommunityPostCreateParams, 'id' | 'createdBy'>> {
  updatedBy?: string | null;
}

export interface CommunityPostReconstituteParams
  extends Required<
    Omit<
      CommunityPostCreateParams,
      'caption' | 'mediaFileId' | 'mediaUrl' | 'thumbnailUrl' | 'location'
    >
  > {
  caption: string | null;
  mediaFileId: string | null;
  mediaUrl: string | null;
  thumbnailUrl: string | null;
  location: string | null;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  updatedBy: string | null;
  isDeleted: boolean;
  deletedAt: Date | null;
  deletedBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}
