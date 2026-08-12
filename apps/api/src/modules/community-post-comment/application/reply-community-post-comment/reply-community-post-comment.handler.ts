import { randomUUID } from 'crypto';

import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '@modules/community-post/domain/services/community-post-domain.service';
import { CommunityPostComment } from '../../domain/entities/community-post-comment.entity';
import { InvalidReplyTargetException } from '../../domain/errors/community-post-comment-business.exception';
import type {
  CommunityPostCommentRepository,
  CommunityPostCommentView,
} from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import { ReplyCommunityPostCommentCommand } from './reply-community-post-comment.command';

export class ReplyCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly postDomainService: CommunityPostDomainService,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    command: ReplyCommunityPostCommentCommand,
  ): Promise<CommunityPostCommentView> {
    const post = this.postDomainService.ensureExists(
      await this.postRepo.findById(command.postId),
    );

    this.postDomainService.ensurePubliclyVisible(post);

    const parent = this.domainService.ensureExists(
      await this.commentRepo.findById(command.parentCommentId),
    );

    this.domainService.ensurePubliclyVisible(parent);

    if (parent.postId !== command.postId) {
      throw new InvalidReplyTargetException();
    }

    const comment = CommunityPostComment.create({
      id: randomUUID(),
      postId: command.postId,
      userId: command.userId,
      parentId: command.parentCommentId,
      content: command.content,
    });

    await this.commentRepo.save(comment);
    await this.postRepo.incrementCommentCount(command.postId);

    return this.domainService.ensureViewExists(
      await this.commentRepo.findViewById(comment.id),
    );
  }
}
