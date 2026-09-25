import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CoinTransactionDirection,
  Prisma,
  ReferralStatus,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

@Injectable()
export class ReferralQueryService {
  constructor(private readonly prisma: PrismaService) {}

  async getCustomerSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        referralCode: true,
        coinWallet: true,
        referralAsReferred: {
          select: {
            id: true,
            publicId: true,
            referrer: { select: { id: true, name: true, referralCode: true } },
            status: true,
            createdAt: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const [
      referralsMade,
      totalReferrals,
      successfulReferrals,
      pendingReferrals,
      coinsEarnedFromReferrals,
    ] = await Promise.all([
      this.prisma.referral.findMany({
        where: { referrerUserId: userId },
        orderBy: { createdAt: 'desc' },
        take: 50,
        select: {
          id: true,
          publicId: true,
          status: true,
          rewardCoins: true,
          rewardedAt: true,
          createdAt: true,
          referred: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.referral.count({ where: { referrerUserId: userId } }),
      this.prisma.referral.count({
        where: {
          referrerUserId: userId,
          status: ReferralStatus.REWARDED,
        },
      }),
      this.prisma.referral.count({
        where: {
          referrerUserId: userId,
          status: { in: [ReferralStatus.PENDING, ReferralStatus.QUALIFIED] },
        },
      }),
      this.prisma.coinTransaction.aggregate({
        where: {
          userId,
          type: 'REFERRAL_REWARD',
          direction: CoinTransactionDirection.CREDIT,
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      referralCode: user.referralCode,
      referredBy: user.referralAsReferred,
      wallet: user.coinWallet,
      stats: {
        totalReferrals,
        successfulReferrals,
        pendingReferrals,
        coinsEarnedFromReferrals: coinsEarnedFromReferrals._sum.amount ?? 0,
      },
      referrals: referralsMade,
    };
  }

  async listCustomerTransactions(
    userId: string,
    query: {
      direction?: CoinTransactionDirection;
      from?: Date;
      to?: Date;
      take?: number;
      skip?: number;
    },
  ) {
    const where: Prisma.CoinTransactionWhereInput = { userId };
    if (query.direction) where.direction = query.direction;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = query.from;
      if (query.to) where.createdAt.lte = query.to;
    }

    const [items, total] = await Promise.all([
      this.prisma.coinTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.take ?? 50,
        skip: query.skip ?? 0,
        include: {
          referral: {
            select: {
              referred: { select: { name: true, email: true } },
            },
          },
          redemption: { select: { publicId: true } },
        },
      }),
      this.prisma.coinTransaction.count({ where }),
    ]);

    return { items, total };
  }

  async listCustomerRedemptions(userId: string) {
    return this.prisma.redemptionRequest.findMany({
      where: { userId },
      orderBy: { requestedAt: 'desc' },
    });
  }

  async getAdminDashboardMetrics() {
    const [
      totalUsers,
      totalReferralCodes,
      referralCounts,
      coinSums,
      redemptionCounts,
    ] = await Promise.all([
      this.prisma.user.count({ where: { deletedAt: null, role: 'STUDENT' } }),
      this.prisma.user.count({
        where: { deletedAt: null, referralCode: { not: null } },
      }),
      this.prisma.referral.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
      this.prisma.coinWallet.aggregate({
        _sum: {
          totalEarned: true,
          totalRedeemed: true,
          availableCoins: true,
          lockedCoins: true,
        },
      }),
      this.prisma.redemptionRequest.groupBy({
        by: ['status'],
        _count: { _all: true },
      }),
    ]);

    const referralByStatus = Object.fromEntries(
      referralCounts.map((row) => [row.status, row._count._all]),
    ) as Record<string, number>;

    const redemptionByStatus = Object.fromEntries(
      redemptionCounts.map((row) => [row.status, row._count._all]),
    ) as Record<string, number>;

    return {
      users: { totalUsers, totalReferralCodes },
      referrals: {
        total: Object.values(referralByStatus).reduce((a, b) => a + b, 0),
        successful: referralByStatus.REWARDED ?? 0,
        pending:
          (referralByStatus.PENDING ?? 0) + (referralByStatus.QUALIFIED ?? 0),
        rejectedOrExpired:
          (referralByStatus.REJECTED ?? 0) + (referralByStatus.EXPIRED ?? 0),
        byStatus: referralByStatus,
      },
      coins: {
        totalIssued: coinSums._sum.totalEarned ?? 0,
        totalRedeemed: coinSums._sum.totalRedeemed ?? 0,
        outstandingAvailable: coinSums._sum.availableCoins ?? 0,
        outstandingLocked: coinSums._sum.lockedCoins ?? 0,
      },
      redemptions: {
        byStatus: redemptionByStatus,
        pending: redemptionByStatus.PENDING ?? 0,
      },
    };
  }

  async listAdminReferrals(query: {
    search?: string;
    status?: ReferralStatus;
    referralCode?: string;
    referrerUserId?: string;
    from?: Date;
    to?: Date;
    take?: number;
    skip?: number;
  }) {
    const where: Prisma.ReferralWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.referralCode) {
      where.referralCodeUsed = {
        equals: query.referralCode.trim(),
        mode: 'insensitive',
      };
    }
    if (query.referrerUserId) where.referrerUserId = query.referrerUserId;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = query.from;
      if (query.to) where.createdAt.lte = query.to;
    }
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { publicId: { contains: term, mode: 'insensitive' } },
        { referralCodeUsed: { contains: term, mode: 'insensitive' } },
        { referrer: { name: { contains: term, mode: 'insensitive' } } },
        { referred: { name: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.referral.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.take ?? 25,
        skip: query.skip ?? 0,
        include: {
          referrer: { select: { id: true, name: true, email: true, referralCode: true } },
          referred: { select: { id: true, name: true, email: true, createdAt: true } },
          coinTransactions: {
            where: { type: 'REFERRAL_REWARD' },
            take: 1,
          },
        },
      }),
      this.prisma.referral.count({ where }),
    ]);

    return { items, total };
  }

  async getAdminReferralById(id: string) {
    const referral = await this.prisma.referral.findFirst({
      where: { OR: [{ id }, { publicId: id }] },
      include: {
        referrer: { select: { id: true, name: true, email: true, referralCode: true } },
        referred: { select: { id: true, name: true, email: true, createdAt: true } },
        coinTransactions: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!referral) throw new NotFoundException('Referral not found');
    return referral;
  }

  async getAdminUserReferralSummary(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
        coinWallet: true,
        referralAsReferred: {
          include: {
            referrer: { select: { id: true, name: true, referralCode: true } },
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const referrals = await this.prisma.referral.findMany({
      where: { referrerUserId: userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      include: {
        referred: { select: { id: true, name: true, email: true, createdAt: true } },
      },
    });

    const [totalReferrals, successfulReferrals, coinsEarned] = await Promise.all([
      this.prisma.referral.count({ where: { referrerUserId: userId } }),
      this.prisma.referral.count({
        where: { referrerUserId: userId, status: ReferralStatus.REWARDED },
      }),
      this.prisma.coinTransaction.aggregate({
        where: { userId, type: 'REFERRAL_REWARD' },
        _sum: { amount: true },
      }),
    ]);

    return {
      user,
      referrals,
      stats: {
        totalReferrals,
        successful: successfulReferrals,
        coinsEarned: coinsEarned._sum.amount ?? 0,
      },
    };
  }

  async listAdminCoinTransactions(query: {
    userId?: string;
    type?: string;
    direction?: CoinTransactionDirection;
    from?: Date;
    to?: Date;
    take?: number;
    skip?: number;
  }) {
    const where: Prisma.CoinTransactionWhereInput = {};
    if (query.userId) where.userId = query.userId;
    if (query.type) where.type = query.type as Prisma.EnumCoinTransactionTypeFilter['equals'];
    if (query.direction) where.direction = query.direction;
    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = query.from;
      if (query.to) where.createdAt.lte = query.to;
    }

    const [items, total] = await Promise.all([
      this.prisma.coinTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: query.take ?? 50,
        skip: query.skip ?? 0,
        include: {
          user: { select: { id: true, name: true, email: true } },
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.coinTransaction.count({ where }),
    ]);

    return { items, total };
  }

  async listAdminRedemptions(query: {
    search?: string;
    status?: string;
    userId?: string;
    from?: Date;
    to?: Date;
    take?: number;
    skip?: number;
  }) {
    const where: Prisma.RedemptionRequestWhereInput = {};
    if (query.status) {
      where.status = query.status as Prisma.EnumRedemptionStatusFilter['equals'];
    }
    if (query.userId) where.userId = query.userId;
    if (query.from || query.to) {
      where.requestedAt = {};
      if (query.from) where.requestedAt.gte = query.from;
      if (query.to) where.requestedAt.lte = query.to;
    }
    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { publicId: { contains: term, mode: 'insensitive' } },
        { user: { name: { contains: term, mode: 'insensitive' } } },
        { user: { email: { contains: term, mode: 'insensitive' } } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.redemptionRequest.findMany({
        where,
        orderBy: { requestedAt: 'desc' },
        take: query.take ?? 25,
        skip: query.skip ?? 0,
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      this.prisma.redemptionRequest.count({ where }),
    ]);

    return { items, total };
  }

  async getAdminRedemptionById(id: string) {
    const item = await this.prisma.redemptionRequest.findFirst({
      where: { OR: [{ id }, { publicId: id }] },
      include: {
        user: { select: { id: true, name: true, email: true } },
        wallet: true,
        coinTransactions: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!item) throw new NotFoundException('Redemption request not found');
    return item;
  }

  async listReferralCodeUsageStats(query: { search?: string; take?: number; skip?: number }) {
    const users = await this.prisma.user.findMany({
      where: {
        referralCode: { not: null },
        deletedAt: null,
        ...(query.search?.trim()
          ? {
              OR: [
                { name: { contains: query.search.trim(), mode: 'insensitive' } },
                { referralCode: { contains: query.search.trim(), mode: 'insensitive' } },
                { email: { contains: query.search.trim(), mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        referralCode: true,
      },
      take: query.take ?? 25,
      skip: query.skip ?? 0,
      orderBy: { name: 'asc' },
    });

    const enriched = await Promise.all(
      users.map(async (owner) => {
        const grouped = await this.prisma.referral.groupBy({
          by: ['status'],
          where: { referrerUserId: owner.id },
          _count: { _all: true },
        });
        const byStatus = Object.fromEntries(
          grouped.map((row) => [row.status, row._count._all]),
        ) as Record<string, number>;
        const totalUses = Object.values(byStatus).reduce((a, b) => a + b, 0);
        const coinsEarned = await this.prisma.coinTransaction.aggregate({
          where: { userId: owner.id, type: 'REFERRAL_REWARD' },
          _sum: { amount: true },
        });
        return {
          owner,
          totalUses,
          successfulUses: byStatus.REWARDED ?? 0,
          pendingUses:
            (byStatus.PENDING ?? 0) + (byStatus.QUALIFIED ?? 0),
          rejectedUses:
            (byStatus.REJECTED ?? 0) + (byStatus.EXPIRED ?? 0),
          coinsEarned: coinsEarned._sum.amount ?? 0,
        };
      }),
    );

    return enriched;
  }
}
