import { randomUUID } from 'crypto';

import type { CommunityPostRepository } from '@modules/community-post/domain/repositories/community-post.repository';
import { CommunityPostDomainService } from '@modules/community-post/domain/services/community-post-domain.service';
import { CommunityPostComment } from '../../domain/entities/community-post-comment.entity';
import type { CommunityPostCommentRepository } from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentDomainService } from '../../domain/services/community-post-comment-domain.service';
import type { CommunityPostCommentView } from '../../domain/repositories/community-post-comment.repository';
import { CreateCommunityPostCommentCommand } from './create-community-post-comment.command';

export class CreateCommunityPostCommentHandler {
  constructor(
    private readonly commentRepo: CommunityPostCommentRepository,
    private readonly postRepo: CommunityPostRepository,
    private readonly postDomainService: CommunityPostDomainService,
    private readonly domainService: CommunityPostCommentDomainService,
  ) {}

  async execute(
    command: CreateCommunityPostCommentCommand,
  ): Promise<CommunityPostCommentView> {
    const post = this.postDomainService.ensureExists(
      await this.postRepo.findById(command.postId),
    );

    this.postDomainService.ensurePubliclyVisible(post);

    const comment = CommunityPostComment.create({
      id: randomUUID(),
      postId: command.postId,
      userId: command.userId,
      content: command.content,
    });

    await this.commentRepo.save(comment);
    await this.postRepo.incrementCommentCount(command.postId);

    return this.domainService.ensureViewExists(
      await this.commentRepo.findViewById(comment.id),
    );
  }
}
