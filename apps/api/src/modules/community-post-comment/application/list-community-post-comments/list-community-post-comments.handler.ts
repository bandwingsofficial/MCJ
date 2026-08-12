import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '@modules/community-post/domain/services/community-post-domain.service';
import type { CommunityPostCommentView } from '../../domain/repositories/community-post-comment.repository';
import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import { ListCommunityPostCommentsQuery } from './list-community-post-comments.query';

export class ListCommunityPostCommentsHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly postDomainService: CommunityPostDomainService,
  ) {}

  async execute(
    query: ListCommunityPostCommentsQuery,
  ): Promise<CommunityPostCommentView[]> {
    const post = this.postDomainService.ensureExists(
      await this.postRepo.findById(query.postId),
    );

    if (query.onlyPublished) {
      this.postDomainService.ensurePubliclyVisible(post);
    }

    return this.commentRepo.findNestedByPostId(
      query.postId,
      query.includeBlocked,
    );
  }
}
