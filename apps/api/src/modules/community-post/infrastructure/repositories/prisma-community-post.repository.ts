import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CommunityPost } from '../../domain/entities/community-post.entity';
import { CommunityPostStatus } from '../../domain/enums/community-post-status.enum';
import type {
  CommunityPostListFilters,
  CommunityPostRepository,
} from '../../domain/repositories/community-post.repository';
import { CommunityPostMapper } from '../mappers/community-post.mapper';

@Injectable()
export class PrismaCommunityPostRepository
  implements CommunityPostRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async save(post: CommunityPost): Promise<void> {
    const data = CommunityPostMapper.toPersistence(post);

    await this.prisma.communityPost.upsert({
      where: { id: post.id },
      create: data,
      update: data,
    });
  }

  async findById(
    id: string,
    includeDeleted = false,
  ): Promise<CommunityPost | null> {
    const record = await this.prisma.communityPost.findFirst({
      where: {
        id,
        ...(includeDeleted ? {} : { isDeleted: false }),
      },
    });

    return record ? CommunityPostMapper.toDomain(record) : null;
  }

  async findMany(
    filters: CommunityPostListFilters = {},
  ): Promise<CommunityPost[]> {
    const records = await this.prisma.communityPost.findMany({
      where: this.buildWhere(filters),
      skip: filters.skip,
      take: filters.take,
      orderBy: { createdAt: 'desc' },
    });

    return records.map((record) => CommunityPostMapper.toDomain(record));
  }

  async findPublished(
    filters: CommunityPostListFilters = {},
  ): Promise<CommunityPost[]> {
    return this.findMany({ ...filters, onlyPublished: true });
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.prisma.communityPost.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });
  }

  async incrementShareCount(id: string): Promise<void> {
    await this.prisma.communityPost.update({
      where: { id },
      data: { shareCount: { increment: 1 } },
    });
  }

  async incrementLikeCount(id: string): Promise<void> {
    await this.prisma.communityPost.update({
      where: { id },
      data: { likeCount: { increment: 1 } },
    });
  }

  async decrementLikeCount(id: string): Promise<void> {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      select: { likeCount: true },
    });

    if (!post || post.likeCount <= 0) {
      return;
    }

    await this.prisma.communityPost.update({
      where: { id },
      data: { likeCount: { decrement: 1 } },
    });
  }

  async incrementCommentCount(id: string): Promise<void> {
    await this.prisma.communityPost.update({
      where: { id },
      data: { commentCount: { increment: 1 } },
    });
  }

  async decrementCommentCount(id: string): Promise<void> {
    const post = await this.prisma.communityPost.findUnique({
      where: { id },
      select: { commentCount: true },
    });

    if (!post || post.commentCount <= 0) {
      return;
    }

    await this.prisma.communityPost.update({
      where: { id },
      data: { commentCount: { decrement: 1 } },
    });
  }

  async softDeleteCascade(
    id: string,
    deletedBy?: string | null,
  ): Promise<void> {
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.communityPost.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: now,
          deletedBy: deletedBy ?? null,
        },
      }),
      this.prisma.communityPostLike.updateMany({
        where: { postId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: now },
      }),
      this.prisma.communityPostComment.updateMany({
        where: { postId: id, isDeleted: false },
        data: { isDeleted: true, deletedAt: now },
      }),
    ]);
  }

  async restoreCascade(
    id: string,
    updatedBy?: string | null,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.communityPost.update({
        where: { id },
        data: {
          isDeleted: false,
          deletedAt: null,
          deletedBy: null,
          updatedBy: updatedBy ?? null,
        },
      }),
      this.prisma.communityPostLike.updateMany({
        where: { postId: id, isDeleted: true },
        data: { isDeleted: false, deletedAt: null },
      }),
      this.prisma.communityPostComment.updateMany({
        where: { postId: id, isDeleted: true },
        data: { isDeleted: false, deletedAt: null },
      }),
    ]);
  }

  async permanentDeleteCascade(id: string): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.communityPostComment.deleteMany({
        where: { postId: id },
      }),
      this.prisma.communityPostLike.deleteMany({
        where: { postId: id },
      }),
      this.prisma.communityPost.delete({ where: { id } }),
    ]);
  }

  private buildWhere(
    filters: CommunityPostListFilters,
  ): Prisma.CommunityPostWhereInput {
    const where: Prisma.CommunityPostWhereInput = {};

    if (!filters.includeDeleted) {
      where.isDeleted = false;
    }

    if (filters.onlyPublished) {
      where.status = CommunityPostStatus.PUBLISHED;
      where.isActive = true;
      where.isDeleted = false;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.search?.trim()) {
      const search = filters.search.trim();
      where.OR = [
        { caption: { contains: search, mode: 'insensitive' } },
        { location: { contains: search, mode: 'insensitive' } },
        { hashtags: { has: search } },
      ];
    }

    return where;
  }
}
