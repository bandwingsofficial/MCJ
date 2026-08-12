import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import type { CommunityPostCommentView } from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import { AdminBlockCommunityPostCommentCommand } from './admin-block-community-post-comment.command';

export class AdminBlockCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    command: AdminBlockCommunityPostCommentCommand,
  ): Promise<CommunityPostCommentView> {
    const comment = this.domainService.ensureExists(
      await this.commentRepo.findById(command.commentId, true),
    );

    this.domainService.ensureNotDeleted(comment);

    comment.block();
    await this.commentRepo.save(comment);

    return this.domainService.ensureViewExists(
      await this.commentRepo.findViewById(comment.id, true, true),
    );
  }
}
