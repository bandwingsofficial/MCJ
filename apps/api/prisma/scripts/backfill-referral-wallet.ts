/**
 * Safe, repeatable backfill for referral codes + coin wallets on existing student users.
 *
 * Usage: pnpm exec ts-node prisma/scripts/backfill-referral-wallet.ts
 */
import { PrismaClient, Role } from '@prisma/client';

import { generateReferralCodeCandidate } from '../../src/modules/referral-rewards/utils/referral-code.util';

const prisma = new PrismaClient();

async function ensureReferralCode(userId: string, current: string | null) {
  if (current) return;
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const candidate = generateReferralCodeCandidate();
    const taken = await prisma.user.findFirst({
      where: {
        referralCode: { equals: candidate, mode: 'insensitive' },
        NOT: { id: userId },
      },
      select: { id: true },
    });
    if (taken) continue;
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: candidate },
      });
      return;
    } catch {
      // retry on collision
    }
  }
  throw new Error(`Failed to assign referral code for user ${userId}`);
}

async function main() {
  await prisma.referralRewardSettings.upsert({
    where: { id: 'default' },
    create: { id: 'default' },
    update: {},
  });

  const users = await prisma.user.findMany({
    where: { deletedAt: null, role: Role.STUDENT },
    select: { id: true, referralCode: true },
  });

  for (const user of users) {
    await prisma.$transaction(async (tx) => {
      await tx.coinWallet.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
    });
    await ensureReferralCode(user.id, user.referralCode);
  }

  console.log(`Backfilled ${users.length} student users.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
