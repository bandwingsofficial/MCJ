import { Injectable, NotFoundException } from '@nestjs/common';
import {
  CoinTransactionDirection,
  CoinTransactionType,
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

    const activeSettings = await this.prisma.referralRewardSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
      select: { referralEnabled: true },
    });
    const referralEnabled = activeSettings?.referralEnabled ?? true;

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
      referralEnabled,
      referralCode: referralEnabled ? user.referralCode : null,
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
    const direction = this.normalizeTransactionDirection(query.direction);
    if (direction === CoinTransactionDirection.CREDIT) {
      return this.listCustomerEarnHistory(userId, query);
    }

    const where: Prisma.CoinTransactionWhereInput = { userId };
    if (direction) where.direction = direction;
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

  /**
   * Earn history: ledger CREDIT rows plus rewarded referrals that predate or
   * missed ledger writes (display-only; does not mutate wallet balances).
   */
  async listCustomerEarnHistory(
    userId: string,
    query: {
      from?: Date;
      to?: Date;
      take?: number;
      skip?: number;
    },
  ) {
    const creditWhere: Prisma.CoinTransactionWhereInput = {
      userId,
      direction: CoinTransactionDirection.CREDIT,
    };
    if (query.from || query.to) {
      creditWhere.createdAt = {};
      if (query.from) creditWhere.createdAt.gte = query.from;
      if (query.to) creditWhere.createdAt.lte = query.to;
    }

    const [ledgerItems, rewardedReferrals, userReferralLedgerRows, wallet, firstDebit] =
      await Promise.all([
        this.prisma.coinTransaction.findMany({
          where: creditWhere,
          orderBy: { createdAt: 'desc' },
          include: {
            referral: {
              select: {
                referred: { select: { name: true, email: true } },
              },
            },
            redemption: { select: { publicId: true } },
          },
        }),
        this.prisma.referral.findMany({
          where: {
            referrerUserId: userId,
            status: ReferralStatus.REWARDED,
            rewardCoins: { gt: 0 },
          },
          orderBy: { rewardedAt: 'desc' },
          select: {
            id: true,
            publicId: true,
            rewardCoins: true,
            rewardedAt: true,
            createdAt: true,
            referred: { select: { name: true, email: true } },
          },
        }),
        this.prisma.coinTransaction.findMany({
          where: {
            userId,
            type: CoinTransactionType.REFERRAL_REWARD,
            referralId: { not: null },
          },
          select: { referralId: true },
        }),
        this.prisma.coinWallet.findUnique({
          where: { userId },
          select: { totalEarned: true, createdAt: true },
        }),
        this.prisma.coinTransaction.findFirst({
          where: {
            userId,
            direction: CoinTransactionDirection.DEBIT,
          },
          orderBy: { createdAt: 'asc' },
          select: { createdAt: true, availableBefore: true },
        }),
      ]);

    const referralIdsWithLedger = new Set(
      userReferralLedgerRows
        .map((row) => row.referralId)
        .filter((id): id is string => Boolean(id)),
    );

    const referralFallbackItems = rewardedReferrals
      .filter((referral) => !referralIdsWithLedger.has(referral.id))
      .map((referral) => ({
        id: `referral-reward:${referral.id}`,
        publicId: referral.publicId,
        type: CoinTransactionType.REFERRAL_REWARD,
        direction: CoinTransactionDirection.CREDIT,
        amount: referral.rewardCoins,
        description: 'Referral reward',
        availableBefore: null,
        availableAfter: null,
        createdAt: referral.rewardedAt ?? referral.createdAt,
        referral: {
          referred: {
            name: referral.referred.name,
            email: referral.referred.email,
          },
        },
        redemption: null,
      }));

    const creditedTotal =
      ledgerItems.reduce((sum, row) => sum + row.amount, 0) +
      referralFallbackItems.reduce((sum, row) => sum + row.amount, 0);
    const walletEarned = wallet?.totalEarned ?? 0;
    const orphanEarnGap = walletEarned - creditedTotal;
    const walletGapItems =
      orphanEarnGap > 0
        ? (() => {
            const balanceAfterEarn =
              firstDebit?.availableBefore ?? walletEarned;
            return [
              {
                id: `wallet-earn-gap:${userId}`,
                publicId: 'WALLET-EARN',
                type: CoinTransactionType.ADJUSTMENT,
                direction: CoinTransactionDirection.CREDIT,
                amount: orphanEarnGap,
                description: 'Recorded wallet earnings',
                availableBefore: balanceAfterEarn - orphanEarnGap,
                availableAfter: balanceAfterEarn,
                createdAt: firstDebit
                  ? new Date(firstDebit.createdAt.getTime() - 1)
                  : (wallet?.createdAt ?? new Date()),
                referral: null,
                redemption: null,
              },
            ];
          })()
        : [];

    const merged = [
      ...ledgerItems,
      ...referralFallbackItems,
      ...walletGapItems,
    ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const skip = query.skip ?? 0;
    const take = query.take ?? 50;
    const items = merged.slice(skip, skip + take);

    return { items, total: merged.length };
  }

  private normalizeTransactionDirection(
    direction?: CoinTransactionDirection | string,
  ): CoinTransactionDirection | undefined {
    if (!direction) return undefined;
    const normalized = String(direction).toUpperCase();
    if (normalized === CoinTransactionDirection.CREDIT) {
      return CoinTransactionDirection.CREDIT;
    }
    if (normalized === CoinTransactionDirection.DEBIT) {
      return CoinTransactionDirection.DEBIT;
    }
    return direction as CoinTransactionDirection;
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
    const where: Prisma.UserWhereInput = {
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
    };

    const [total, users] = await Promise.all([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          referralCode: true,
        },
        take: query.take ?? 25,
        skip: query.skip ?? 0,
        orderBy: { name: 'asc' },
      }),
    ]);

    const items = await Promise.all(
      users.map(async (owner) => {
        const wallet = await this.prisma.coinWallet.findUnique({
          where: { userId: owner.id },
          select: {
            totalEarned: true,
            totalRedeemed: true,
            availableCoins: true,
            lockedCoins: true,
          },
        });

        const coinsEarned = wallet?.totalEarned ?? 0;
        const redemptions = wallet?.totalRedeemed ?? 0;
        const availableCoins =
          (wallet?.availableCoins ?? 0) + (wallet?.lockedCoins ?? 0);

        return {
          owner,
          coinsEarned,
          redemptions,
          availableCoins,
        };
      }),
    );

    return { items, total };
  }
}
