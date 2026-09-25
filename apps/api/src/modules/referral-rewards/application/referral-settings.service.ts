import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Prisma,
  ReferralQualificationCondition,
  type ReferralRewardSettings,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';

type SettingsInput = Partial<{
  name: string;
  referralEnabled: boolean;
  rewardCoinsPerReferral: number;
  qualificationCondition: ReferralQualificationCondition;
  referralExpiryDays: number | null;
  maxReferralsPerReferrer: number | null;
  redemptionEnabled: boolean;
  coinsPerRupee: number;
  minRedemptionCoins: number;
  maxRedemptionCoins: number | null;
}>;

@Injectable()
export class ReferralSettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettingsInTransaction(
    tx: Prisma.TransactionClient,
  ): Promise<ReferralRewardSettings> {
    let active = await tx.referralRewardSettings.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    });

    if (!active) {
      active = await tx.referralRewardSettings.upsert({
        where: { id: 'default' },
        create: {
          id: 'default',
          name: 'Default Rewards',
          isActive: true,
        },
        update: { isActive: true },
      });
    }

    return active;
  }

  async getSettings(): Promise<ReferralRewardSettings> {
    return this.getSettingsInTransaction(this.prisma);
  }

  async listSettings() {
    await this.getSettings();
    return this.prisma.referralRewardSettings.findMany({
      orderBy: [{ isActive: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async createSettings(input: SettingsInput & { name: string }, updatedByUserId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const currentActive = await tx.referralRewardSettings.findFirst({
        where: { isActive: true },
      });

      await tx.referralRewardSettings.updateMany({
        data: { isActive: false },
      });

      return tx.referralRewardSettings.create({
        data: {
          name: input.name.trim() || 'Rewards configuration',
          isActive: true,
          referralEnabled: input.referralEnabled ?? true,
          rewardCoinsPerReferral: input.rewardCoinsPerReferral ?? 100,
          qualificationCondition:
            input.qualificationCondition ?? ReferralQualificationCondition.REGISTRATION,
          referralExpiryDays: input.referralExpiryDays ?? null,
          maxReferralsPerReferrer: input.maxReferralsPerReferrer ?? null,
          redemptionEnabled: input.redemptionEnabled ?? true,
          coinsPerRupee: input.coinsPerRupee ?? 10,
          minRedemptionCoins: input.minRedemptionCoins ?? 500,
          maxRedemptionCoins: input.maxRedemptionCoins ?? null,
          nextReferralPublicNumber: currentActive?.nextReferralPublicNumber ?? 1,
          nextRedemptionPublicNumber: currentActive?.nextRedemptionPublicNumber ?? 1,
          nextTransactionPublicNumber: currentActive?.nextTransactionPublicNumber ?? 1,
          updatedByUserId: updatedByUserId ?? null,
        },
      });
    });
  }

  async updateSettings(
    id: string,
    input: SettingsInput,
    updatedByUserId?: string,
  ) {
    const existing = await this.prisma.referralRewardSettings.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Configuration not found');
    }

    return this.prisma.referralRewardSettings.update({
      where: { id },
      data: {
        ...input,
        ...(input.name != null ? { name: input.name.trim() } : {}),
        updatedByUserId: updatedByUserId ?? null,
      },
    });
  }

  async activateSettings(id: string, updatedByUserId?: string) {
    return this.prisma.$transaction(async (tx) => {
      const target = await tx.referralRewardSettings.findUnique({ where: { id } });
      if (!target) {
        throw new NotFoundException('Configuration not found');
      }

      const currentActive = await tx.referralRewardSettings.findFirst({
        where: { isActive: true },
      });

      await tx.referralRewardSettings.updateMany({
        data: { isActive: false },
      });

      return tx.referralRewardSettings.update({
        where: { id },
        data: {
          isActive: true,
          nextReferralPublicNumber:
            currentActive?.nextReferralPublicNumber ?? target.nextReferralPublicNumber,
          nextRedemptionPublicNumber:
            currentActive?.nextRedemptionPublicNumber ?? target.nextRedemptionPublicNumber,
          nextTransactionPublicNumber:
            currentActive?.nextTransactionPublicNumber ?? target.nextTransactionPublicNumber,
          updatedByUserId: updatedByUserId ?? null,
        },
      });
    });
  }

  /** @deprecated Use updateSettings(id, ...) */
  async updateActiveSettings(input: SettingsInput, updatedByUserId?: string) {
    const active = await this.getSettings();
    return this.updateSettings(active.id, input, updatedByUserId);
  }

  moneyValuePaiseFromCoins(coins: number, coinsPerRupee: number): number {
    if (coinsPerRupee <= 0) return 0;
    const rupees = coins / coinsPerRupee;
    return Math.floor(rupees * 100);
  }
}
