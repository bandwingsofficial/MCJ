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
import { resolvePortalUserDisplay } from '../utils/portal-user-display.util';

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
        {
          student: {
            OR: [
              { firstName: { contains: term, mode: 'insensitive' } },
              { lastName: { contains: term, mode: 'insensitive' } },
              { email: { contains: term, mode: 'insensitive' } },
              { phone: { contains: term, mode: 'insensitive' } },
              { studentCode: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
        {
          userDeletionRecord: {
            OR: [
              { originalEmail: { contains: term, mode: 'insensitive' } },
              { originalEmailNormalized: { contains: term, mode: 'insensitive' } },
              { originalName: { contains: term, mode: 'insensitive' } },
              { originalPhone: { contains: term, mode: 'insensitive' } },
            ],
          },
        },
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
          student: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          userDeletionRecord: {
            select: {
              originalEmailNormalized: true,
              originalEmail: true,
              originalName: true,
              originalPhone: true,
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

    const items = users.map((user) => {
      const display = resolvePortalUserDisplay(user);

      return {
        id: user.id,
        name: display.name,
        email: display.email,
        phone: display.phone,
        referralCode: display.referralCode,
        referredBy: user.referralAsReferred?.referrer ?? null,
        totalReferrals: user._count.referralsAsReferrer,
        availableCoins: user.coinWallet?.availableCoins ?? 0,
        lockedCoins: user.coinWallet?.lockedCoins ?? 0,
        accountStatus: resolvePortalAccountStatus(user),
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      };
    });

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
        student: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        userDeletionRecord: {
          select: {
            originalEmailNormalized: true,
            originalEmail: true,
            originalName: true,
            originalPhone: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');

    const display = resolvePortalUserDisplay(user);

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

    const { student: _student, userDeletionRecord: _record, ...userFields } =
      user;

    return {
      user: {
        ...userFields,
        name: display.name,
        email: display.email,
        phone: display.phone,
        referralCode: display.referralCode,
        accountStatus: resolvePortalAccountStatus(user),
        userDeletionRecord: user.userDeletionRecord,
      },
      referralSummary,
      referralStats: {
        successfulReferrals,
        pendingReferrals,
      },
    };
  }
}
