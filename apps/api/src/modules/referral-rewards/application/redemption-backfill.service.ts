import { Injectable, Logger } from '@nestjs/common';
import {
  CoinTransactionDirection,
  CoinTransactionType,
  EnrollmentStatus,
  Prisma,
  RedemptionStatus,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { formatPublicId } from '../utils/public-id.util';
import { ReferralSettingsService } from './referral-settings.service';

export type RedemptionBackfillResult = {
  linkedFromTransactions: number;
  backfilledEnrollmentsCommitted: number;
  backfilledEnrollmentsLedgerOnly: number;
  skipped: number;
  coinTransactionsRepaired: number;
};

type Tx = Prisma.TransactionClient;

@Injectable()
export class RedemptionBackfillService {
  private readonly logger = new Logger(RedemptionBackfillService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: ReferralSettingsService,
  ) {}

  async backfillMissingRedemptions(): Promise<RedemptionBackfillResult> {
    const result: RedemptionBackfillResult = {
      linkedFromTransactions: 0,
      backfilledEnrollmentsCommitted: 0,
      backfilledEnrollmentsLedgerOnly: 0,
      skipped: 0,
      coinTransactionsRepaired: 0,
    };

    const orphanTransactions = await this.prisma.coinTransaction.findMany({
      where: {
        type: CoinTransactionType.REDEMPTION,
        redemptionId: null,
      },
      orderBy: { createdAt: 'asc' },
    });

    for (const coinTx of orphanTransactions) {
      const linked = await this.prisma.$transaction(async (tx) => {
        const current = await tx.coinTransaction.findUnique({
          where: { id: coinTx.id },
          select: { redemptionId: true },
        });
        if (current?.redemptionId) return false;

        await this.createRedemptionForTransaction(tx, coinTx);
        return true;
      });
      if (linked) result.linkedFromTransactions += 1;
      else result.skipped += 1;
    }

    const enrollments = await this.prisma.enrollment.findMany({
      where: {
        redeemedCoins: { gt: 0 },
        isDeleted: false,
        status: {
          notIn: [
            EnrollmentStatus.PENDING,
            EnrollmentStatus.PENDING_APPROVAL,
            EnrollmentStatus.CANCELLED,
            EnrollmentStatus.REJECTED,
          ],
        },
        OR: [
          { paymentStatus: { in: ['PAID', 'PARTIAL'] } },
          {
            status: {
              in: [
                EnrollmentStatus.ADVANCED,
                EnrollmentStatus.ADMITTED,
                EnrollmentStatus.ACTIVE,
                EnrollmentStatus.COMPLETED,
              ],
            },
          },
        ],
      },
      select: {
        id: true,
        enrollmentNumber: true,
        redeemedCoins: true,
        coinDiscountAmount: true,
        updatedAt: true,
        studentId: true,
      },
    });

    for (const enrollment of enrollments) {
      const idempotencyKey = `enrollment-coin:${enrollment.id}`;
      const existingTx = await this.prisma.coinTransaction.findUnique({
        where: { idempotencyKey },
      });
      if (existingTx) {
        if (!existingTx.redemptionId) {
          await this.prisma.$transaction(async (tx) => {
            const fresh = await tx.coinTransaction.findUnique({
              where: { id: existingTx.id },
            });
            if (fresh && !fresh.redemptionId) {
              await this.createRedemptionForTransaction(tx, fresh);
            }
          });
          result.linkedFromTransactions += 1;
        }
        continue;
      }

      const byReference = await this.prisma.coinTransaction.findFirst({
        where: {
          type: CoinTransactionType.REDEMPTION,
          referenceType: 'ENROLLMENT',
          referenceId: enrollment.id,
        },
      });
      if (byReference) {
        if (!byReference.redemptionId) {
          await this.prisma.$transaction(async (tx) => {
            const fresh = await tx.coinTransaction.findUnique({
              where: { id: byReference.id },
            });
            if (fresh && !fresh.redemptionId) {
              await this.createRedemptionForTransaction(tx, fresh);
              result.linkedFromTransactions += 1;
            }
          });
        }
        continue;
      }

      const student = await this.prisma.student.findUnique({
        where: { id: enrollment.studentId },
        select: { userId: true },
      });
      if (!student?.userId) {
        result.skipped += 1;
        continue;
      }

      const outcome = await this.prisma.$transaction(async (tx) => {
        const dup = await tx.coinTransaction.findUnique({
          where: { idempotencyKey },
        });
        if (dup) return 'skip' as const;

        const wallet = await tx.coinWallet.findUnique({
          where: { userId: student.userId! },
        });
        if (!wallet) return 'skip' as const;

        const coins = enrollment.redeemedCoins;
        if (wallet.lockedCoins >= coins) {
          await this.commitLockedEnrollmentCoins(tx, {
            userId: student.userId!,
            wallet,
            amount: coins,
            enrollmentId: enrollment.id,
            enrollmentNumber: enrollment.enrollmentNumber,
            idempotencyKey,
            processedAt: enrollment.updatedAt,
          });
          return 'committed' as const;
        }

        await this.createLedgerOnlyEnrollmentRedemption(tx, {
          userId: student.userId!,
          wallet,
          enrollment,
          idempotencyKey,
        });
        return 'ledger' as const;
      });

      if (outcome === 'committed') {
        result.backfilledEnrollmentsCommitted += 1;
      } else if (outcome === 'ledger') {
        result.backfilledEnrollmentsLedgerOnly += 1;
      } else {
        result.skipped += 1;
      }
    }

    result.coinTransactionsRepaired =
      await this.repairIncorrectCoinTransactionBalances();

    this.logger.log(`Redemption backfill finished: ${JSON.stringify(result)}`);
    return result;
  }

  async repairIncorrectCoinTransactionBalances(): Promise<number> {
    const transactions = await this.prisma.coinTransaction.findMany({
      orderBy: [{ walletId: 'asc' }, { createdAt: 'asc' }],
    });

    let repaired = 0;

    for (const tx of transactions) {
      const patch = this.computeCorrectAvailableBalances(tx);
      if (!patch) continue;

      await this.prisma.coinTransaction.update({
        where: { id: tx.id },
        data: patch,
      });
      repaired += 1;
    }

    if (repaired > 0) {
      this.logger.log(`Repaired ${repaired} coin transaction balance row(s)`);
    }

    return repaired;
  }

  private computeCorrectAvailableBalances(tx: {
    direction: CoinTransactionDirection;
    amount: number;
    availableBefore: number;
    availableAfter: number;
    lockedBefore: number;
    lockedAfter: number;
  }): { availableBefore: number; availableAfter: number } | null {
    if (tx.amount <= 0) return null;

    if (tx.direction === CoinTransactionDirection.CREDIT) {
      const expectedAfter = tx.availableBefore + tx.amount;
      if (tx.availableAfter === expectedAfter) return null;
      return {
        availableBefore: tx.availableBefore,
        availableAfter: expectedAfter,
      };
    }

    const lockReduced = tx.lockedBefore > tx.lockedAfter;
    if (lockReduced) {
      const expectedBefore = tx.availableAfter + tx.amount;
      if (
        tx.availableBefore === expectedBefore &&
        tx.availableAfter === tx.availableAfter
      ) {
        return null;
      }
      return {
        availableBefore: expectedBefore,
        availableAfter: tx.availableAfter,
      };
    }

    const expectedBefore = tx.availableAfter + tx.amount;
    if (tx.availableBefore === expectedBefore) return null;
    return {
      availableBefore: expectedBefore,
      availableAfter: tx.availableAfter,
    };
  }

  private async createRedemptionForTransaction(
    tx: Tx,
    coinTx: {
      id: string;
      userId: string;
      walletId: string;
      amount: number;
      createdAt: Date;
    },
  ) {
    const settings = await this.settingsService.getSettingsInTransaction(tx);
    const sequence = settings.nextRedemptionPublicNumber ?? 1;
    const publicId = formatPublicId('RD', sequence);
    const moneyValuePaise = this.settingsService.moneyValuePaiseFromCoins(
      coinTx.amount,
      settings.coinsPerRupee,
    );
    const processedAt = coinTx.createdAt;

    const redemption = await tx.redemptionRequest.create({
      data: {
        publicId,
        userId: coinTx.userId,
        walletId: coinTx.walletId,
        coins: coinTx.amount,
        moneyValuePaise,
        coinsPerRupeeSnapshot: settings.coinsPerRupee,
        status: RedemptionStatus.PROCESSED,
        requestedAt: processedAt,
        processedAt,
      },
    });

    await tx.coinTransaction.update({
      where: { id: coinTx.id },
      data: { redemptionId: redemption.id },
    });

    await tx.referralRewardSettings.update({
      where: { id: settings.id },
      data: { nextRedemptionPublicNumber: sequence + 1 },
    });
  }

  private async commitLockedEnrollmentCoins(
    tx: Tx,
    input: {
      userId: string;
      wallet: { id: string; availableCoins: number; lockedCoins: number };
      amount: number;
      enrollmentId: string;
      enrollmentNumber: string;
      idempotencyKey: string;
      processedAt: Date;
    },
  ) {
    const { wallet, amount, userId, enrollmentId, enrollmentNumber, idempotencyKey, processedAt } =
      input;

    if (wallet.lockedCoins < amount) {
      throw new Error('Insufficient locked coins for enrollment backfill commit');
    }

    const settings = await this.settingsService.getSettingsInTransaction(tx);
    const redemptionSequence = settings.nextRedemptionPublicNumber ?? 1;
    const redemptionPublicId = formatPublicId('RD', redemptionSequence);
    const moneyValuePaise = this.settingsService.moneyValuePaiseFromCoins(
      amount,
      settings.coinsPerRupee,
    );

    const redemption = await tx.redemptionRequest.create({
      data: {
        publicId: redemptionPublicId,
        userId,
        walletId: wallet.id,
        coins: amount,
        moneyValuePaise,
        coinsPerRupeeSnapshot: settings.coinsPerRupee,
        status: RedemptionStatus.PROCESSED,
        requestedAt: processedAt,
        processedAt,
      },
    });

    const txnSequence = settings.nextTransactionPublicNumber ?? 1;
    const publicId = formatPublicId('TXN', txnSequence);
    const lockedAfter = wallet.lockedCoins - amount;
    const availableBefore = wallet.availableCoins + amount;
    const availableAfter = wallet.availableCoins;

    await tx.coinWallet.update({
      where: { id: wallet.id },
      data: {
        lockedCoins: lockedAfter,
        totalRedeemed: { increment: amount },
      },
    });

    await tx.coinTransaction.create({
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
        description: `Coins applied to enrollment ${enrollmentNumber}`,
        referenceType: 'ENROLLMENT',
        referenceId: enrollmentId,
        redemptionId: redemption.id,
        idempotencyKey,
        createdAt: processedAt,
      },
    });

    await tx.referralRewardSettings.update({
      where: { id: settings.id },
      data: {
        nextTransactionPublicNumber: txnSequence + 1,
        nextRedemptionPublicNumber: redemptionSequence + 1,
      },
    });
  }

  private async createLedgerOnlyEnrollmentRedemption(
    tx: Tx,
    input: {
      userId: string;
      wallet: { id: string; availableCoins: number; lockedCoins: number };
      enrollment: {
        id: string;
        enrollmentNumber: string;
        redeemedCoins: number;
        coinDiscountAmount: Prisma.Decimal;
        updatedAt: Date;
      };
      idempotencyKey: string;
    },
  ) {
    const { userId, wallet, enrollment, idempotencyKey } = input;
    const coins = enrollment.redeemedCoins;
    const settings = await this.settingsService.getSettingsInTransaction(tx);
    const redemptionSequence = settings.nextRedemptionPublicNumber ?? 1;
    const redemptionPublicId = formatPublicId('RD', redemptionSequence);
    const moneyValuePaise =
      Number(enrollment.coinDiscountAmount) > 0
        ? Math.round(Number(enrollment.coinDiscountAmount) * 100)
        : this.settingsService.moneyValuePaiseFromCoins(
            coins,
            settings.coinsPerRupee,
          );
    const processedAt = enrollment.updatedAt;

    const redemption = await tx.redemptionRequest.create({
      data: {
        publicId: redemptionPublicId,
        userId,
        walletId: wallet.id,
        coins,
        moneyValuePaise,
        coinsPerRupeeSnapshot: settings.coinsPerRupee,
        status: RedemptionStatus.PROCESSED,
        requestedAt: processedAt,
        processedAt,
      },
    });

    const txnSequence = settings.nextTransactionPublicNumber ?? 1;
    const publicId = formatPublicId('TXN', txnSequence);
    const availableAfter = wallet.availableCoins;
    const availableBefore = wallet.availableCoins + coins;

    await tx.coinTransaction.create({
      data: {
        publicId,
        walletId: wallet.id,
        userId,
        type: CoinTransactionType.REDEMPTION,
        direction: CoinTransactionDirection.DEBIT,
        amount: coins,
        availableBefore,
        availableAfter,
        lockedBefore: wallet.lockedCoins,
        lockedAfter: wallet.lockedCoins,
        description: `Coins applied to enrollment ${enrollment.enrollmentNumber} (backfill)`,
        referenceType: 'ENROLLMENT',
        referenceId: enrollment.id,
        redemptionId: redemption.id,
        idempotencyKey,
        createdAt: processedAt,
      },
    });

    await tx.referralRewardSettings.update({
      where: { id: settings.id },
      data: {
        nextTransactionPublicNumber: txnSequence + 1,
        nextRedemptionPublicNumber: redemptionSequence + 1,
      },
    });
  }
}
