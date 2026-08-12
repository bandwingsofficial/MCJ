import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import type { CommunityPostCommentView } from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import { GetCommunityPostCommentQuery } from './get-community-post-comment.query';

export class GetCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    query: GetCommunityPostCommentQuery,
  ): Promise<CommunityPostCommentView> {
    return this.domainService.ensureViewExists(
      await this.commentRepo.findViewById(
        query.commentId,
        query.includeBlocked,
        query.includeDeleted,
      ),
    );
  }
}
