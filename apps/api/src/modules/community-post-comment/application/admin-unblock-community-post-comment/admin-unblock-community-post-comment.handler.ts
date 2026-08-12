import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import type { CommunityPostCommentView } from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import { AdminUnblockCommunityPostCommentCommand } from './admin-unblock-community-post-comment.command';

export class AdminUnblockCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    command: AdminUnblockCommunityPostCommentCommand,
  ): Promise<CommunityPostCommentView> {
    const comment = this.domainService.ensureExists(
      await this.commentRepo.findById(command.commentId, true),
    );

    this.domainService.ensureNotDeleted(comment);

    comment.unblock();
    await this.commentRepo.save(comment);

    return this.domainService.ensureViewExists(
      await this.commentRepo.findViewById(comment.id, true, true),
    );
  }
}
