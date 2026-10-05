import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import type {
  CommunityPostEngagementRepository,
  CommunityPostShareView,
} from '../../domain/repositories/community-post-engagement.repository';

const shareUserInclude = {
  user: {
    include: {
      profile: true,
      student: true,
    },
  },
} satisfies Prisma.CommunityPostShareInclude;

type ShareWithUser = Prisma.CommunityPostShareGetPayload<{
  include: typeof shareUserInclude;
}>;

@Injectable()
export class PrismaCommunityPostEngagementRepository
  implements CommunityPostEngagementRepository
{
  constructor(private readonly prisma: PrismaService) {}

  async recordView(postId: string, userId: string): Promise<number> {
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.communityPostView.create({
        data: { postId, userId },
      });

      return tx.communityPost.update({
        where: { id: postId },
        data: { viewCount: { increment: 1 } },
        select: { viewCount: true, shareCount: true },
      });
    });

    return this.ensureViewCountAtLeastShareCount(
      postId,
      updated.viewCount,
      updated.shareCount,
    );
  }

  async recordShare(postId: string, userId: string): Promise<number> {
    const updated = await this.prisma.$transaction(async (tx) => {
      await tx.communityPostShare.create({
        data: { postId, userId },
      });

      return tx.communityPost.update({
        where: { id: postId },
        data: { shareCount: { increment: 1 } },
        select: { viewCount: true, shareCount: true },
      });
    });

    await this.ensureViewCountAtLeastShareCount(
      postId,
      updated.viewCount,
      updated.shareCount,
    );

    return updated.shareCount;
  }

  async userHasViewedPost(postId: string, userId: string): Promise<boolean> {
    const view = await this.prisma.communityPostView.findFirst({
      where: { postId, userId },
      select: { id: true },
    });

    return Boolean(view);
  }

  async findSharesByPostId(
    postId: string,
    options: { skip?: number; take?: number } = {},
  ): Promise<CommunityPostShareView[]> {
    const records = await this.prisma.communityPostShare.findMany({
      where: { postId },
      include: shareUserInclude,
      orderBy: { createdAt: 'desc' },
      skip: options.skip,
      take: options.take,
    });

    return records.map((record) => this.toShareView(record));
  }

  async countSharesByPostId(postId: string): Promise<number> {
    return this.prisma.communityPostShare.count({
      where: { postId },
    });
  }

  async syncShareCountFromRecords(postId: string): Promise<number> {
    const total = await this.countSharesByPostId(postId);

    const post = await this.prisma.communityPost.update({
      where: { id: postId },
      data: { shareCount: total },
      select: { viewCount: true, shareCount: true },
    });

    await this.ensureViewCountAtLeastShareCount(
      postId,
      post.viewCount,
      post.shareCount,
    );

    return total;
  }

  private async ensureViewCountAtLeastShareCount(
    postId: string,
    viewCount: number,
    shareCount: number,
  ): Promise<number> {
    if (shareCount <= viewCount) {
      return viewCount;
    }

    const updated = await this.prisma.communityPost.update({
      where: { id: postId },
      data: { viewCount: shareCount },
      select: { viewCount: true },
    });

    return updated.viewCount;
  }

  private toShareView(record: ShareWithUser): CommunityPostShareView {
    const profile = record.user.profile;
    const name =
      [profile?.firstName, profile?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || record.user.name;

    const email = record.user.email?.trim() || '';
    const phone =
      record.user.phone?.trim() ||
      record.user.student?.phone?.trim() ||
      null;

    return {
      id: record.id,
      postId: record.postId,
      sharedAt: record.createdAt,
      user: {
        name,
        email,
        phone,
      },
    };
  }
}
