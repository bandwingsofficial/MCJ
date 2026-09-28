import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const wallets = await prisma.coinWallet.findMany({
    where: { totalEarned: { gt: 0 } },
    take: 10,
    select: {
      userId: true,
      totalEarned: true,
      totalRedeemed: true,
      availableCoins: true,
    },
  });

  console.log(`Wallets with totalEarned > 0: ${wallets.length}`);

  for (const w of wallets) {
    const credits = await prisma.coinTransaction.findMany({
      where: { userId: w.userId, direction: 'CREDIT' },
      select: { id: true, type: true, amount: true, referralId: true },
    });
    const refRewardTx = await prisma.coinTransaction.findMany({
      where: { userId: w.userId, type: 'REFERRAL_REWARD' },
      select: { id: true, direction: true, amount: true, referralId: true },
    });
    const rewardedReferrals = await prisma.referral.findMany({
      where: { referrerUserId: w.userId, status: 'REWARDED' },
      select: { id: true, rewardCoins: true, publicId: true },
    });
    const sumCredit = credits.reduce((s, t) => s + t.amount, 0);

    console.log('\n---');
    console.log({
      userId: w.userId,
      wallet: w,
      creditTxCount: credits.length,
      sumCredit,
      refRewardTx,
      rewardedReferrals,
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
