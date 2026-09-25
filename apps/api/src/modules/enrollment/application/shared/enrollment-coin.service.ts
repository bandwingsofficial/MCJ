import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CoinTransactionDirection,
  CoinTransactionType,
  Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../../infrastructure/prisma/prisma.service';
import { CoinWalletService } from '../../../referral-rewards/application/coin-wallet.service';
import { ReferralSettingsService } from '../../../referral-rewards/application/referral-settings.service';
import { formatPublicId } from '../../../referral-rewards/utils/public-id.util';
import { Enrollment } from '../../domain/entities/enrollment.entity';
import { EnrollmentStatus } from '../../domain/enums/enrollment-status.enum';
import type { EnrollmentRepository } from '../../domain/repositories/enrollment.repository';
import { ENROLLMENT_TOKENS } from '../../enrollment.tokens';

type Tx = Prisma.TransactionClient;

@Injectable()
export class EnrollmentCoinService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(ENROLLMENT_TOKENS.ENROLLMENT_REPOSITORY)
    private readonly enrollmentRepo: EnrollmentRepository,
    private readonly walletService: CoinWalletService,
    private readonly settingsService: ReferralSettingsService,
  ) {}

  rupeesFromCoins(coins: number, coinsPerRupee: number): number {
    if (coinsPerRupee <= 0) {
      return 0;
    }
    return Math.round((coins / coinsPerRupee) * 100) / 100;
  }

  async validateCoinsForEnrollment(
    userId: string,
    enrollment: Enrollment,
    coins: number,
  ): Promise<{ coinDiscountAmount: number; coinsPerRupee: number }> {
    if (coins <= 0) {
      throw new BadRequestException('Coin amount must be positive');
    }

    if (
      enrollment.status !== EnrollmentStatus.PENDING ||
      enrollment.redeemedCoins > 0
    ) {
      throw new BadRequestException(
        'Coins can only be applied to a pending enrollment once',
      );
    }

    const settings = await this.settingsService.getSettings();
    if (!settings.redemptionEnabled) {
      throw new BadRequestException('Coin redemption is currently disabled');
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

    const wallet = await this.walletService.getWalletForUser(userId);
    if (wallet.availableCoins < coins) {
      throw new BadRequestException('Insufficient available coins');
    }

    const coinDiscountAmount = this.rupeesFromCoins(
      coins,
      settings.coinsPerRupee,
    );

    if (coinDiscountAmount <= 0) {
      throw new BadRequestException('Coin discount must be greater than zero');
    }

    const totalDiscount =
      enrollment.discountAmount + coinDiscountAmount;
    if (totalDiscount > enrollment.feeAmount) {
      throw new BadRequestException(
        'Coin discount exceeds the remaining course fee',
      );
    }

    return {
      coinDiscountAmount,
      coinsPerRupee: settings.coinsPerRupee,
    };
  }

  async applyCoinsToEnrollment(
    userId: string,
    enrollmentId: string,
    coins: number,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId, true);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const student = await this.prisma.student.findFirst({
      where: { userId, id: enrollment.studentId },
      select: { id: true },
    });
    if (!student) {
      throw new BadRequestException('Enrollment access denied');
    }

    const { coinDiscountAmount } = await this.validateCoinsForEnrollment(
      userId,
      enrollment,
      coins,
    );

    return this.prisma.$transaction(async (tx) => {
      await this.walletService.lockCoins(tx, userId, coins);

      enrollment.update({
        coinDiscountAmount,
        redeemedCoins: coins,
        updatedBy: userId,
      });

      await this.saveEnrollmentInTransaction(tx, enrollment);
      return enrollment;
    });
  }

  async commitCoinsForEnrollment(enrollment: Enrollment): Promise<void> {
    if (enrollment.redeemedCoins <= 0) {
      return;
    }

    const student = await this.prisma.student.findUnique({
      where: { id: enrollment.studentId },
      select: { userId: true },
    });
    if (!student?.userId) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await this.commitLockedCoins(
        tx,
        student.userId,
        enrollment.redeemedCoins,
        enrollment.id,
        enrollment.enrollmentNumber.getValue(),
      );
    });
  }

  async removeAppliedCoinsForUser(
    userId: string,
    enrollmentId: string,
  ): Promise<void> {
    const enrollment = await this.enrollmentRepo.findById(enrollmentId, true);
    if (!enrollment) {
      throw new NotFoundException('Enrollment not found');
    }

    const student = await this.prisma.student.findFirst({
      where: { userId, id: enrollment.studentId },
      select: { id: true },
    });
    if (!student) {
      throw new BadRequestException('Enrollment access denied');
    }

    if (enrollment.status !== EnrollmentStatus.PENDING) {
      throw new BadRequestException(
        'Coins can only be removed from a pending enrollment',
      );
    }

    if (enrollment.redeemedCoins <= 0) {
      throw new BadRequestException('No coins applied to this enrollment');
    }

    if (enrollment.paidAmount > 0) {
      throw new BadRequestException(
        'Coins cannot be removed after payment has started',
      );
    }

    await this.releaseCoinsForEnrollment(enrollment);
  }

  async releaseCoinsForEnrollment(enrollment: Enrollment): Promise<void> {
    if (enrollment.redeemedCoins <= 0) {
      return;
    }

    const student = await this.prisma.student.findUnique({
      where: { id: enrollment.studentId },
      select: { userId: true },
    });
    if (!student?.userId) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await this.walletService.unlockCoins(
        tx,
        student.userId,
        enrollment.redeemedCoins,
      );

      enrollment.update({
        coinDiscountAmount: 0,
        redeemedCoins: 0,
      });

      await this.saveEnrollmentInTransaction(tx, enrollment);
    });
  }

  private async commitLockedCoins(
    tx: Tx,
    userId: string,
    amount: number,
    enrollmentId: string,
    enrollmentNumber: string,
  ) {
    const wallet = await tx.coinWallet.findUnique({ where: { userId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    if (wallet.lockedCoins < amount) {
      throw new BadRequestException('Insufficient locked coins');
    }

    const settings = await this.settingsService.getSettingsInTransaction(tx);
    const sequence = settings?.nextTransactionPublicNumber ?? 1;
    const publicId = formatPublicId('TXN', sequence);

    const lockedAfter = wallet.lockedCoins - amount;
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
        availableBefore: wallet.availableCoins,
        availableAfter: wallet.availableCoins,
        lockedBefore: wallet.lockedCoins,
        lockedAfter,
        description: `Coins applied to enrollment ${enrollmentNumber}`,
        referenceType: 'ENROLLMENT',
        referenceId: enrollmentId,
        idempotencyKey: `enrollment-coin:${enrollmentId}`,
      },
    });

    if (settings) {
      await tx.referralRewardSettings.update({
        where: { id: settings.id },
        data: { nextTransactionPublicNumber: sequence + 1 },
      });
    }
  }

  private async saveEnrollmentInTransaction(
    tx: Tx,
    enrollment: Enrollment,
  ): Promise<void> {
    await tx.enrollment.update({
      where: { id: enrollment.id },
      data: {
        coinDiscountAmount: enrollment.coinDiscountAmount,
        redeemedCoins: enrollment.redeemedCoins,
        finalAmount: enrollment.finalAmount,
        dueAmount: enrollment.dueAmount,
        paymentStatus: enrollment.paymentStatus,
        updatedAt: enrollment.updatedAt,
        updatedBy: enrollment.updatedBy,
      },
    });
  }
}
