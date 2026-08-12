import type { CommunityPostRepository } from '../../domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '../../domain/services/community-post-domain.service';
import type { CommunityPostCommentRepository } from '@modules/community-post-comment/domain/repositories/community-post-comment.repository';
import { GetCommunityPostResult } from '../get-community-post/get-community-post.result';
import { GetCommunityPostQuery } from './get-community-post.query';

export class GetCommunityPostHandler {
  constructor(
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostDomainService,
    private readonly commentRepo: CommunityPostCommentRepository,
  ) {}

  async execute(
    query: GetCommunityPostQuery,
  ): Promise<GetCommunityPostResult> {
    const post = this.domainService.ensureExists(
      await this.postRepo.findById(query.id, query.includeDeleted),
    );

    if (query.onlyPublished) {
      this.domainService.ensurePubliclyVisible(post);
    }

    const comments = query.includeComments
      ? await this.commentRepo.findNestedByPostId(
          post.id,
          query.includeBlockedComments,
        )
      : [];

    return GetCommunityPostResult.fromEntity(post, comments);
  }
}
