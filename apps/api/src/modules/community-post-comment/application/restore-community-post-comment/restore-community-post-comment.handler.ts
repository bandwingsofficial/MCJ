import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import type { CommunityPostCommentView } from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import { RestoreCommunityPostCommentCommand } from './restore-community-post-comment.command';

export class RestoreCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    command: RestoreCommunityPostCommentCommand,
  ): Promise<CommunityPostCommentView> {
    const comment = this.domainService.ensureExists(
      await this.commentRepo.findById(command.commentId, true),
    );

    this.domainService.ensureDeleted(comment);
    this.domainService.ensureOwner(comment, command.userId);

    comment.restore();
    await this.commentRepo.save(comment);
    await this.postRepo.incrementCommentCount(comment.postId);

    return this.domainService.ensureViewExists(
      await this.commentRepo.findViewById(comment.id),
    );
  }
}
