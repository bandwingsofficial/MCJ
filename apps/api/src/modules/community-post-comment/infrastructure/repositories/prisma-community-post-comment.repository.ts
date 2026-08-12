import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CommunityPostComment } from '../../domain/entities/community-post-comment.entity';
import type {
  CommunityPostCommentRepository,
  CommunityPostCommentView,
} from '../../domain/repositories/community-post-comment.repository';
import { CommunityPostCommentMapper } from '../mappers/community-post-comment.mapper';
import {
  communityPostCommentUserInclude,
  CommunityPostCommentResponseMapper,
} from '../mappers/community-post-comment-response.mapper';

@Injectable()
export class PrismaCommunityPostCommentRepository
  implements CommunityPostCommentRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(comment: CommunityPostComment): Promise<void> {
    const data = CommunityPostCommentMapper.toPersistence(comment);

    await this.prisma.communityPostComment.upsert({
      where: { id: comment.id },
      create: data,
      update: data,
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<CommunityPostComment | null> {
    const record = await this.prisma.communityPostComment.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CommunityPostCommentMapper.toDomain(record) : null;
  }

  async findViewById(
    id: string,
    includeBlocked = false,
    includeDeleted = false,
  ): Promise<CommunityPostCommentView | null> {
    const record = await this.prisma.communityPostComment.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
        ...(includeBlocked ? {} : { isBlocked: false }),
      },
      include: communityPostCommentUserInclude,
    });

    if (!record) {
      return null;
    }

    const replies = await this.findRepliesForComment(record.id, includeBlocked);

    return CommunityPostCommentResponseMapper.toView(record, replies, {
      includeModeration: includeBlocked || includeDeleted,
    });
  }

  async findNestedByPostId(
    postId: string,
    includeBlocked = false,
  ): Promise<CommunityPostCommentView[]> {
    const records = await this.prisma.communityPostComment.findMany({
      where: {
        postId,
        isDeleted: false,
        ...(includeBlocked ? {} : { isBlocked: false }),
      },
      include: communityPostCommentUserInclude,
      orderBy: { createdAt: 'asc' },
    });

    return CommunityPostCommentResponseMapper.nestComments(records);
  }

  async countActiveByPostId(postId: string): Promise<number> {
    return this.prisma.communityPostComment.count({
      where: {
        postId,
        isDeleted: false,
        isBlocked: false,
      },
    });
  }

  private async findRepliesForComment(
    parentId: string,
    includeBlocked: boolean,
  ): Promise<CommunityPostCommentView[]> {
    const records = await this.prisma.communityPostComment.findMany({
      where: {
        parentId,
        isDeleted: false,
        ...(includeBlocked ? {} : { isBlocked: false }),
      },
      include: communityPostCommentUserInclude,
      orderBy: { createdAt: 'asc' },
    });

    return records.map((record) =>
      CommunityPostCommentResponseMapper.toView(record, []),
    );
  }
}
