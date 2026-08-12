import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import { DeleteCommunityPostCommentCommand } from './delete-community-post-comment.command';

export class DeleteCommunityPostCommentResult {
  constructor(
    public readonly id: string,
    public readonly deleted: boolean,
    public readonly deletedAt: Date | null,
  ) {}
}

export class DeleteCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    command: DeleteCommunityPostCommentCommand,
  ): Promise<DeleteCommunityPostCommentResult> {
    const comment = this.domainService.ensureExists(
      await this.commentRepo.findById(command.commentId),
    );

    this.domainService.ensureNotDeleted(comment);
    this.domainService.ensureOwner(comment, command.userId);

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
