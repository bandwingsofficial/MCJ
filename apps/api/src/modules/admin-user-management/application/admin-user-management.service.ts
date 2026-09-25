import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AccountStatus,
  CoinTransactionDirection,
  Prisma,
  ReferralStatus,
  Role,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { ReferralQueryService } from '../../referral-rewards/application/referral-query.service';
import { resolvePortalAccountStatus } from '../utils/account-status.util';

export interface AdminUserListQuery {
  search?: string;
  accountStatus?: 'ALL' | 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  referral?: 'ALL' | 'HAS_REFERRAL' | 'NO_REFERRAL';
  from?: Date;
  to?: Date;
  take?: number;
  skip?: number;
}

@Injectable()
export class AdminUserManagementService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly referralQuery: ReferralQueryService,
  ) {}

  async getDashboardMetrics() {
    const newUsersSince = new Date();
    newUsersSince.setDate(newUsersSince.getDate() - 30);

    const [active, suspended, deleted, newUsers, withCodes, referrers, referralRewards, coinTotals] =
      await Promise.all([
        this.prisma.user.count({
          where: { role: Role.STUDENT, deletedAt: null, status: AccountStatus.ACTIVE },
        }),
        this.prisma.user.count({
          where: { role: Role.STUDENT, deletedAt: null, status: AccountStatus.BLOCKED },
        }),
        this.prisma.user.count({
          where: { role: Role.STUDENT, deletedAt: { not: null } },
        }),
        this.prisma.user.count({
          where: {
            role: Role.STUDENT,
            createdAt: { gte: newUsersSince },
          },
        }),
        this.prisma.user.count({
          where: { role: Role.STUDENT, referralCode: { not: null } },
        }),
        this.prisma.user.count({
          where: {
            role: Role.STUDENT,
            referralsAsReferrer: { some: {} },
          },
        }),
        this.prisma.coinTransaction.aggregate({
          where: { type: 'REFERRAL_REWARD', direction: CoinTransactionDirection.CREDIT },
          _sum: { amount: true },
        }),
        this.prisma.coinWallet.aggregate({
          _sum: { totalEarned: true, totalRedeemed: true },
        }),
      ]);

    const totalRecords = active + suspended + deleted;

    return {
      totalUsers: totalRecords,
      activeUsers: active,
      suspendedUsers: suspended,
      deletedUsers: deleted,
      newUsers,
      usersWithReferralCodes: withCodes,
      usersWhoReferredOthers: referrers,
      totalReferralRewards: referralRewards._sum.amount ?? 0,
      totalCoinsIssued: coinTotals._sum.totalEarned ?? 0,
      totalCoinsRedeemed: coinTotals._sum.totalRedeemed ?? 0,
    };
  }

  async listUsers(query: AdminUserListQuery) {
    const where: Prisma.UserWhereInput = {
      role: Role.STUDENT,
    };

    if (query.accountStatus === 'ACTIVE') {
      where.deletedAt = null;
      where.status = AccountStatus.ACTIVE;
    } else if (query.accountStatus === 'SUSPENDED') {
      where.deletedAt = null;
      where.status = AccountStatus.BLOCKED;
    } else if (query.accountStatus === 'DELETED') {
      where.deletedAt = { not: null };
    }

    if (query.referral === 'HAS_REFERRAL') {
      where.referralAsReferred = { isNot: null };
    } else if (query.referral === 'NO_REFERRAL') {
      where.referralAsReferred = null;
    }

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = query.from;
      if (query.to) where.createdAt.lte = query.to;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
        { referralCode: { contains: term, mode: 'insensitive' } },
        { id: term },
      ];
    }

    const take = query.take ?? 20;
    const skip = query.skip ?? 0;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take,
        skip,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          referralCode: true,
          status: true,
          deletedAt: true,
          createdAt: true,
          lastLoginAt: true,
          coinWallet: {
            select: {
              availableCoins: true,
              lockedCoins: true,
            },
          },
          referralAsReferred: {
            select: {
              referrer: { select: { id: true, name: true } },
            },
          },
          _count: {
            select: {
              referralsAsReferrer: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    const items = users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      referralCode: user.referralCode,
      referredBy: user.referralAsReferred?.referrer ?? null,
      totalReferrals: user._count.referralsAsReferrer,
      availableCoins: user.coinWallet?.availableCoins ?? 0,
      lockedCoins: user.coinWallet?.lockedCoins ?? 0,
      accountStatus: resolvePortalAccountStatus(user),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    }));

    return { items, total, take, skip };
  }

  async getUserDetails(userId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, role: Role.STUDENT },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        referralCode: true,
        status: true,
        deletedAt: true,
        createdAt: true,
        lastLoginAt: true,
        suspendedAt: true,
        suspensionReason: true,
        deletionReason: true,
        deletionSource: true,
        userDeletionRecord: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const referralSummary = await this.referralQuery.getAdminUserReferralSummary(userId);

    const successfulReferrals = await this.prisma.referral.count({
      where: { referrerUserId: userId, status: ReferralStatus.REWARDED },
    });
    const pendingReferrals = await this.prisma.referral.count({
      where: {
        referrerUserId: userId,
        status: { in: [ReferralStatus.PENDING, ReferralStatus.QUALIFIED] },
      },
    });

    return {
      user: {
        ...user,
        accountStatus: resolvePortalAccountStatus(user),
      },
      referralSummary,
      referralStats: {
        successfulReferrals,
        pendingReferrals,
      },
    };
  }
}
