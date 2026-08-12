import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CommunityPostLike } from '../../domain/entities/community-post-like.entity';
import type {
  CommunityPostLikeRepository,
  CommunityPostLikeView,
} from '../../domain/repositories/community-post-like.repository';
import { CommunityPostLikeMapper } from '../mappers/community-post-like.mapper';
import {
  communityPostLikeUserInclude,
  CommunityPostLikeResponseMapper,
} from '../mappers/community-post-like-response.mapper';

@Injectable()
export class PrismaCommunityPostLikeRepository
  implements CommunityPostLikeRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(like: CommunityPostLike): Promise<void> {
    const data = CommunityPostLikeMapper.toPersistence(like);

    await this.prisma.communityPostLike.upsert({
      where: { postId_userId: { postId: like.postId, userId: like.userId } },
      create: data,
      update: data,
    });
  }

  async deleteByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<boolean> {
    const result = await this.prisma.communityPostLike.deleteMany({
      where: { postId, userId, isDeleted: false },
    });

    return result.count > 0;
  }

  async findActiveByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<CommunityPostLike | null> {
    const record = await this.prisma.communityPostLike.findFirst({
      where: { postId, userId, isDeleted: false },
    });

    return record ? CommunityPostLikeMapper.toDomain(record) : null;
  }

  async existsActiveByPostAndUser(
    postId: string,
    userId: string,
  ): Promise<boolean> {
    const record = await this.prisma.communityPostLike.findFirst({
      where: { postId, userId, isDeleted: false },
      select: { id: true },
    });

    return Boolean(record);
  }

  async findViewsByPostId(postId: string): Promise<CommunityPostLikeView[]> {
    const records = await this.prisma.communityPostLike.findMany({
      where: { postId, isDeleted: false },
      include: communityPostLikeUserInclude,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) =>
      CommunityPostLikeResponseMapper.toView(record),
    );
  }
}
