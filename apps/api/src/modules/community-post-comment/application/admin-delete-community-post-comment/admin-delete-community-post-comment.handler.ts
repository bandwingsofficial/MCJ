import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import { AdminDeleteCommunityPostCommentCommand } from './admin-delete-community-post-comment.command';
import { DeleteCommunityPostCommentResult } from '../delete-community-post-comment/delete-community-post-comment.handler';

export class AdminDeleteCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    command: AdminDeleteCommunityPostCommentCommand,
  ): Promise<DeleteCommunityPostCommentResult> {
    const comment = this.domainService.ensureExists(
      await this.commentRepo.findById(command.commentId),
    );

    this.domainService.ensureNotDeleted(comment);

    comment.softDelete();
    await this.commentRepo.save(comment);
    await this.postRepo.decrementCommentCount(comment.postId);

    return new DeleteCommunityPostCommentResult(
      comment.id,
      true,
      comment.deletedAt,
    );
  }
}
