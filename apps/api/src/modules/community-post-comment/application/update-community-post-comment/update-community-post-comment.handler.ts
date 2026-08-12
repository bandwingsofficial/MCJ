import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import type { CommunityPostCommentView } from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import { UpdateCommunityPostCommentCommand } from './update-community-post-comment.command';

export class UpdateCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    command: UpdateCommunityPostCommentCommand,
  ): Promise<CommunityPostCommentView> {
    const comment = this.domainService.ensureExists(
      await this.commentRepo.findById(command.commentId),
    );

    this.domainService.ensureNotDeleted(comment);
    this.domainService.ensureOwner(comment, command.userId);

    comment.updateContent(command.content);
    await this.commentRepo.save(comment);

    return this.domainService.ensureViewExists(
      await this.commentRepo.findViewById(comment.id),
    );
  }
}
