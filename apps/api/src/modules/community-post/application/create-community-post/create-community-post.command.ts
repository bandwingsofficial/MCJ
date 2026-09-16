import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';
import type { CommunityPostMediaInput } from '../../domain/entities/community-post-media.entity';

export class CreateCommunityPostCommand {
  constructor(
    public readonly type: CommunityPostType | undefined,
    public readonly caption?: string | null,
    public readonly mediaFileId?: string | null,
    public readonly media?: CommunityPostMediaInput[],
    public readonly thumbnailUrl?: string | null,
    public readonly hashtags?: string[],
    public readonly mentions?: string[],
    public readonly authorName?: string | null,
    public readonly location?: string | null,
    public readonly status?: CommunityPostStatus,
    public readonly createdBy?: string,
  ) {}
}
