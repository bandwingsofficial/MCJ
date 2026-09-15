import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import { CommunityPostType } from '../../domain/enums/community-post-type.enum';

export class ListCommunityPostsQuery {
  constructor(
    public readonly status?: CommunityPostStatus,
    public readonly type?: CommunityPostType,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly isDeleted?: boolean,
    public readonly isActive?: boolean,
    public readonly onlyPublished = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
