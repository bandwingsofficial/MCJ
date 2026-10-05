import type { CommunityPostShareView } from '../../domain/repositories/community-post-engagement.repository';

export class ListCommunityPostSharesResult {
  constructor(
    public readonly items: CommunityPostShareView[],
    public readonly total: number,
  ) {}
}
