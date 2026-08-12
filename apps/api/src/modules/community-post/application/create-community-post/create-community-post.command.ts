import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';

export class CreateCommunityPostCommand {
  constructor(
    public readonly type: CommunityPostType,
    public readonly caption?: string | null,
    public readonly mediaFileId?: string | null,
    public readonly thumbnailUrl?: string | null,
    public readonly hashtags?: string[],
    public readonly mentions?: string[],
    public readonly location?: string | null,
    public readonly status?: CommunityPostStatus,
    public readonly createdBy?: string,
  ) {}
}
