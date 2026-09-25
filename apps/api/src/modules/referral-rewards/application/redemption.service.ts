import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CoinTransactionType, RedemptionStatus } from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { formatPublicId } from '../utils/public-id.util';
import { CoinWalletService } from './coin-wallet.service';
import { ReferralSettingsService } from './referral-settings.service';

@Injectable()
export class RedemptionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: CoinWalletService,
    private readonly settingsService: ReferralSettingsService,
  ) {}

  async createRedemptionRequest(userId: string, coins: number) {
    const settings = await this.settingsService.getSettings();
    if (!settings.redemptionEnabled) {
      throw new BadRequestException('Redemption is currently disabled');
    }
    if (coins < settings.minRedemptionCoins) {
      throw new BadRequestException(
        `Minimum redemption is ${settings.minRedemptionCoins} coins`,
      );
    }
    if (
      settings.maxRedemptionCoins != null &&
      coins > settings.maxRedemptionCoins
    ) {
      throw new BadRequestException(
        `Maximum redemption is ${settings.maxRedemptionCoins} coins`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const wallet = await tx.coinWallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundException('Wallet not found');
      if (wallet.availableCoins < coins) {
        throw new BadRequestException('Insufficient available coins');
      }

      const activeSettings = await this.settingsService.getSettingsInTransaction(tx);
      const sequence = activeSettings.nextRedemptionPublicNumber ?? 1;
      const publicId = formatPublicId('RD', sequence);

      await this.walletService.lockCoins(tx, userId, coins);

      const moneyValuePaise = this.settingsService.moneyValuePaiseFromCoins(
        coins,
        settings.coinsPerRupee,
      );

      const request = await tx.redemptionRequest.create({
        data: {
          publicId,
          userId,
          walletId: wallet.id,
          coins,
          moneyValuePaise,
          coinsPerRupeeSnapshot: settings.coinsPerRupee,
          status: RedemptionStatus.PENDING,
        },
      });

      await tx.referralRewardSettings.update({
        where: { id: activeSettings.id },
        data: { nextRedemptionPublicNumber: sequence + 1 },
      });

      return request;
    });
  }

  async approveRedemption(id: string, adminUserId: string) {
    const request = await this.prisma.redemptionRequest.findUnique({
      where: { id },
    });
    if (!request) throw new NotFoundException('Redemption request not found');
    if (request.status !== RedemptionStatus.PENDING) {
      throw new BadRequestException('Invalid redemption status transition');
    }
    return this.prisma.redemptionRequest.update({
      where: { id },
      data: {
        status: RedemptionStatus.APPROVED,
        approvedAt: new Date(),
        approvedByUserId: adminUserId,
      },
    });
  }

  async rejectRedemption(id: string, adminUserId: string, reason?: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.redemptionRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException('Redemption request not found');
      if (request.status !== RedemptionStatus.PENDING) {
        throw new BadRequestException('Invalid redemption status transition');
      }

      await this.walletService.unlockCoins(tx, request.userId, request.coins);

      return tx.redemptionRequest.update({
        where: { id },
        data: {
          status: RedemptionStatus.REJECTED,
          rejectedAt: new Date(),
          rejectedByUserId: adminUserId,
          rejectionReason: reason?.trim() || null,
        },
      });
    });
  }

  async processRedemption(id: string, adminUserId: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.redemptionRequest.findUnique({ where: { id } });
      if (!request) throw new NotFoundException('Redemption request not found');
      if (request.status !== RedemptionStatus.APPROVED) {
        throw new BadRequestException(
          'Redemption must be approved before processing',
        );
      }

      await this.walletService.finalizeLockedRedemption(
        tx,
        request.userId,
        request.coins,
        request.id,
        adminUserId,
      );

      return tx.redemptionRequest.update({
        where: { id },
        data: {
          status: RedemptionStatus.PROCESSED,
          processedAt: new Date(),
          processedByUserId: adminUserId,
        },
      });
    });
  }

  async adminAdjustWallet(
    userId: string,
    direction: 'CREDIT' | 'DEBIT',
    amount: number,
    reason: string,
    actorUserId: string,
  ) {
    if (amount <= 0) throw new BadRequestException('Amount must be positive');
    return this.prisma.$transaction(async (tx) => {
      if (direction === 'CREDIT') {
        return this.walletService.creditAvailable(tx, {
          userId,
          amount,
          type: CoinTransactionType.ADMIN_CREDIT,
          description: reason,
          actorUserId,
          idempotencyKey: `admin-credit:${userId}:${Date.now()}:${amount}`,
        });
      }
      return this.walletService.debitAvailable(tx, {
        userId,
        amount,
        type: CoinTransactionType.ADMIN_DEBIT,
        description: reason,
        actorUserId,
        idempotencyKey: `admin-debit:${userId}:${Date.now()}:${amount}`,
      });
    });
  }
}
