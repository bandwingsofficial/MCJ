import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CoinTransactionDirection,
  CoinTransactionType,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { formatPublicId } from '../utils/public-id.util';
import { ReferralSettingsService } from './referral-settings.service';

type Tx = Prisma.TransactionClient;

export interface WalletCreditInput {
  userId: string;
  amount: number;
  type: CoinTransactionType;
  description: string;
  referralId?: string;
  redemptionId?: string;
  actorUserId?: string;
  idempotencyKey?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface WalletDebitInput {
  userId: string;
  amount: number;
  type: CoinTransactionType;
  description: string;
  redemptionId?: string;
  actorUserId?: string;
  idempotencyKey?: string;
}

@Injectable()
export class CoinWalletService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: ReferralSettingsService,
  ) {}

  async getWalletForUser(userId: string) {
    const wallet = await this.prisma.coinWallet.findUnique({
      where: { userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async creditAvailable(tx: Tx, input: WalletCreditInput) {
    if (input.amount <= 0) {
      throw new BadRequestException('Credit amount must be positive');
    }

    const wallet = await tx.coinWallet.findUnique({
      where: { userId: input.userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (input.idempotencyKey) {
      const existing = await tx.coinTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return { wallet, transaction: existing };
    }

    if (input.referralId && input.type === CoinTransactionType.REFERRAL_REWARD) {
      const existingReward = await tx.coinTransaction.findFirst({
        where: {
          referralId: input.referralId,
          type: CoinTransactionType.REFERRAL_REWARD,
        },
      });
      if (existingReward) {
        return { wallet, transaction: existingReward };
      }
    }

    const settings = await this.settingsService.getSettingsInTransaction(tx);
    const sequence = settings?.nextTransactionPublicNumber ?? 1;
    const publicId = formatPublicId('TXN', sequence);

    const availableAfter = wallet.availableCoins + input.amount;
    const updated = await tx.coinWallet.update({
      where: { id: wallet.id },
      data: {
        availableCoins: availableAfter,
        totalEarned: { increment: input.amount },
      },
    });

    const transaction = await tx.coinTransaction.create({
      data: {
        publicId,
        walletId: wallet.id,
        userId: input.userId,
        type: input.type,
        direction: CoinTransactionDirection.CREDIT,
        amount: input.amount,
        availableBefore: wallet.availableCoins,
        availableAfter,
        lockedBefore: wallet.lockedCoins,
        lockedAfter: wallet.lockedCoins,
        description: input.description,
        referralId: input.referralId,
        redemptionId: input.redemptionId,
        actorUserId: input.actorUserId,
        idempotencyKey: input.idempotencyKey,
        referenceType: input.referenceType,
        referenceId: input.referenceId,
      },
    });

    if (settings) {
      await tx.referralRewardSettings.update({
        where: { id: settings.id },
        data: { nextTransactionPublicNumber: sequence + 1 },
      });
    }

    return { wallet: updated, transaction };
  }

  async debitAvailable(tx: Tx, input: WalletDebitInput) {
    if (input.amount <= 0) {
      throw new BadRequestException('Debit amount must be positive');
    }

    const wallet = await tx.coinWallet.findUnique({
      where: { userId: input.userId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    if (wallet.availableCoins < input.amount) {
      throw new BadRequestException('Insufficient available coins');
    }

    if (input.idempotencyKey) {
      const existing = await tx.coinTransaction.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existing) return { wallet, transaction: existing };
    }

    const settings = await this.settingsService.getSettingsInTransaction(tx);
    const sequence = settings?.nextTransactionPublicNumber ?? 1;
    const publicId = formatPublicId('TXN', sequence);

    const availableAfter = wallet.availableCoins - input.amount;
    const updated = await tx.coinWallet.update({
      where: { id: wallet.id },
      data: {
        availableCoins: availableAfter,
        totalRedeemed:
          input.type === CoinTransactionType.REDEMPTION
            ? { increment: input.amount }
            : undefined,
      },
    });

    const transaction = await tx.coinTransaction.create({
      data: {
        publicId,
        walletId: wallet.id,
        userId: input.userId,
        type: input.type,
        direction: CoinTransactionDirection.DEBIT,
        amount: input.amount,
        availableBefore: wallet.availableCoins,
        availableAfter,
        lockedBefore: wallet.lockedCoins,
        lockedAfter: wallet.lockedCoins,
        description: input.description,
        redemptionId: input.redemptionId,
        actorUserId: input.actorUserId,
        idempotencyKey: input.idempotencyKey,
      },
    });

    if (settings) {
      await tx.referralRewardSettings.update({
        where: { id: settings.id },
        data: { nextTransactionPublicNumber: sequence + 1 },
      });
    }

    return { wallet: updated, transaction };
  }

  async lockCoins(tx: Tx, userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Lock amount must be positive');
    }
    const wallet = await tx.coinWallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.availableCoins < amount) {
      throw new BadRequestException('Insufficient available coins');
    }
    return tx.coinWallet.update({
      where: { id: wallet.id },
      data: {
        availableCoins: wallet.availableCoins - amount,
        lockedCoins: wallet.lockedCoins + amount,
      },
    });
  }

  async unlockCoins(tx: Tx, userId: string, amount: number) {
    if (amount <= 0) {
      throw new BadRequestException('Unlock amount must be positive');
    }
    const wallet = await tx.coinWallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.lockedCoins < amount) {
      throw new BadRequestException('Insufficient locked coins');
    }
    return tx.coinWallet.update({
      where: { id: wallet.id },
      data: {
        availableCoins: wallet.availableCoins + amount,
        lockedCoins: wallet.lockedCoins - amount,
      },
    });
  }

  async finalizeLockedRedemption(
    tx: Tx,
    userId: string,
    amount: number,
    redemptionId: string,
    actorUserId?: string,
  ) {
    const wallet = await tx.coinWallet.findUnique({ where: { userId } });
    if (!wallet) throw new NotFoundException('Wallet not found');
    if (wallet.lockedCoins < amount) {
      throw new BadRequestException('Insufficient locked coins');
    }

    const settings = await this.settingsService.getSettingsInTransaction(tx);
    const sequence = settings?.nextTransactionPublicNumber ?? 1;
    const publicId = formatPublicId('TXN', sequence);

    const lockedAfter = wallet.lockedCoins - amount;
    const availableBefore = wallet.availableCoins + amount;
    const availableAfter = wallet.availableCoins;
    const updated = await tx.coinWallet.update({
      where: { id: wallet.id },
      data: {
        lockedCoins: lockedAfter,
        totalRedeemed: { increment: amount },
      },
    });

    const transaction = await tx.coinTransaction.create({
      data: {
        publicId,
        walletId: wallet.id,
        userId,
        type: CoinTransactionType.REDEMPTION,
        direction: CoinTransactionDirection.DEBIT,
        amount,
        availableBefore,
        availableAfter,
        lockedBefore: wallet.lockedCoins,
        lockedAfter,
        description: 'Coin redemption processed',
        redemptionId,
        actorUserId,
      },
    });

    if (settings) {
      await tx.referralRewardSettings.update({
        where: { id: settings.id },
        data: { nextTransactionPublicNumber: sequence + 1 },
      });
    }

    return { wallet: updated, transaction };
  }
}
