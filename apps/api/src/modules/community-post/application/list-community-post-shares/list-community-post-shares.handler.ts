import type { CommunityPostEngagementRepository } from '../../domain/repositories/community-post-engagement.repository';
import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import { ListCommunityPostSharesQuery } from './list-community-post-shares.query';
import { ListCommunityPostSharesResult } from './list-community-post-shares.result';

export class ListCommunityPostSharesHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly engagementRepo: CommunityPostEngagementRepository,
    private readonly postDomainService: CommunityPostDomainService,
  ) {}

  async execute(
    query: ListCommunityPostSharesQuery,
  ): Promise<ListCommunityPostSharesResult> {
    const post = this.postDomainService.ensureExists(
      await this.postRepo.findById(query.postId, query.skipVisibilityCheck),
    );

    if (!query.skipVisibilityCheck) {
      this.postDomainService.ensurePubliclyVisible(post);
    }

    await this.engagementRepo.syncShareCountFromRecords(query.postId);

    const [items, total] = await Promise.all([
      this.engagementRepo.findSharesByPostId(query.postId, {
        skip: query.skip,
        take: query.take,
      }),
      this.engagementRepo.countSharesByPostId(query.postId),
    ]);

    return new ListCommunityPostSharesResult(items, total);
  }
}
