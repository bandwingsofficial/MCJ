import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';

export class ListCommunityPostsQuery {
  constructor(
    public readonly status?: CommunityPostStatus,
    public readonly search?: string,
    public readonly includeDeleted = false,
    public readonly onlyPublished = false,
    public readonly skip?: number,
    public readonly take?: number,
  ) {}
}
