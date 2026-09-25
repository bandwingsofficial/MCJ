import {
  BadRequestException,
  Injectable,
} from '@nestjs/common';
import {
  AccountStatus,
  CoinTransactionType,
  ReferralQualificationCondition,
  ReferralStatus,
  Role,
  type Prisma,
} from '@prisma/client';

import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import {
  generateReferralCodeCandidate,
  normalizeReferralCodeInput,
} from '../utils/referral-code.util';
import { formatPublicId } from '../utils/public-id.util';
import { CoinWalletService } from './coin-wallet.service';
import { ReferralSettingsService } from './referral-settings.service';

type Tx = Prisma.TransactionClient;

export class InvalidReferralCodeError extends BadRequestException {
  constructor(message = 'Invalid referral code') {
    super(message);
  }
}

@Injectable()
export class ReferralRegistrationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly walletService: CoinWalletService,
    private readonly settingsService: ReferralSettingsService,
  ) {}

  async validateReferralCodeForRegistration(
    referralCodeRaw: string | undefined,
    registeringEmail: string,
  ): Promise<{ normalizedCode: string; referrerUserId: string } | null> {
    const normalizedCode = normalizeReferralCodeInput(referralCodeRaw);
    if (!normalizedCode) return null;

    const settings = await this.settingsService.getSettings();
    if (!settings.referralEnabled) {
      throw new InvalidReferralCodeError('Referral program is currently disabled');
    }

    const referrer = await this.prisma.user.findFirst({
      where: {
        referralCode: { equals: normalizedCode, mode: 'insensitive' },
        deletedAt: null,
        status: AccountStatus.ACTIVE,
        role: Role.STUDENT,
      },
      select: { id: true, email: true },
    });

    if (!referrer) {
      throw new InvalidReferralCodeError('Referral code is not valid');
    }

    if (referrer.email.toLowerCase() === registeringEmail.trim().toLowerCase()) {
      throw new InvalidReferralCodeError('You cannot use your own referral code');
    }

    return { normalizedCode, referrerUserId: referrer.id };
  }

  async ensureUserReferralAssets(
    tx: Tx,
    userId: string,
    registeringEmail: string,
    referralCodeRaw?: string,
  ) {
    await this.ensureUniqueReferralCodeOnUser(tx, userId);
    await this.ensureWallet(tx, userId);

    const referralContext = referralCodeRaw
      ? await this.validateReferralCodeForRegistration(referralCodeRaw, registeringEmail)
      : null;

    if (!referralContext) {
      return null;
    }

    return this.createReferralAndMaybeReward(tx, {
      referredUserId: userId,
      referrerUserId: referralContext.referrerUserId,
      referralCodeUsed: referralContext.normalizedCode,
    });
  }

  private async ensureWallet(tx: Tx, userId: string) {
    await tx.coinWallet.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private async ensureUniqueReferralCodeOnUser(tx: Tx, userId: string) {
    const user = await tx.user.findUnique({
      where: { id: userId },
      select: { referralCode: true },
    });
    if (!user) return;
    if (user.referralCode) return;

    for (let attempt = 0; attempt < 12; attempt += 1) {
      const candidate = generateReferralCodeCandidate();
      const taken = await tx.user.findFirst({
        where: {
          referralCode: { equals: candidate, mode: 'insensitive' },
          NOT: { id: userId },
        },
        select: { id: true },
      });
      if (taken) continue;

      try {
        await tx.user.update({
          where: { id: userId },
          data: { referralCode: candidate },
        });
        return;
      } catch {
        // collision race — retry
      }
    }

    throw new BadRequestException('Unable to assign referral code');
  }

  private async createReferralAndMaybeReward(
    tx: Tx,
    input: {
      referredUserId: string;
      referrerUserId: string;
      referralCodeUsed: string;
    },
  ) {
    const existing = await tx.referral.findUnique({
      where: { referredUserId: input.referredUserId },
    });
    if (existing) return existing;

    const settings = await this.settingsService.getSettingsInTransaction(tx);
    if (!settings?.referralEnabled) {
      throw new InvalidReferralCodeError('Referral program is currently disabled');
    }

    if (settings.maxReferralsPerReferrer != null) {
      const count = await tx.referral.count({
        where: {
          referrerUserId: input.referrerUserId,
          status: { in: [ReferralStatus.REWARDED, ReferralStatus.QUALIFIED] },
        },
      });
      if (count >= settings.maxReferralsPerReferrer) {
        throw new InvalidReferralCodeError('Referral limit reached for this code');
      }
    }

    const referralNumber = settings.nextReferralPublicNumber;
    const publicId = formatPublicId('REF', referralNumber);

    let referral = await tx.referral.create({
      data: {
        publicId,
        referrerUserId: input.referrerUserId,
        referredUserId: input.referredUserId,
        referralCodeUsed: input.referralCodeUsed,
        status: ReferralStatus.PENDING,
        rewardCoins: settings.rewardCoinsPerReferral,
      },
    });

    await tx.referralRewardSettings.update({
      where: { id: settings.id },
      data: { nextReferralPublicNumber: referralNumber + 1 },
    });

    if (
      settings.qualificationCondition === ReferralQualificationCondition.REGISTRATION
    ) {
      referral = await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: ReferralStatus.QUALIFIED,
          qualifiedAt: new Date(),
        },
      });

      await this.walletService.creditAvailable(tx, {
        userId: input.referrerUserId,
        amount: settings.rewardCoinsPerReferral,
        type: CoinTransactionType.REFERRAL_REWARD,
        description: 'Referral reward',
        referralId: referral.id,
        idempotencyKey: `referral-reward:${referral.id}`,
      });

      referral = await tx.referral.update({
        where: { id: referral.id },
        data: {
          status: ReferralStatus.REWARDED,
          rewardedAt: new Date(),
          rewardCoins: settings.rewardCoinsPerReferral,
        },
      });
    }

    return referral;
  }

  async backfillExistingUsers() {
    const users = await this.prisma.user.findMany({
      where: { deletedAt: null, role: Role.STUDENT },
      select: { id: true, referralCode: true },
    });

    for (const user of users) {
      await this.prisma.$transaction(async (tx) => {
        if (!user.referralCode) {
          await this.ensureUniqueReferralCodeOnUser(tx, user.id);
        }
        await this.ensureWallet(tx, user.id);
      });
    }
  }
}
