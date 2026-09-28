import { PrismaClient } from '@prisma/client';

const USER_ID = '5c7852d8-55ce-4f6d-8335-d5effaa1d6b4';

const prisma = new PrismaClient();

async function main() {
  const wallet = await prisma.coinWallet.findUnique({ where: { userId: USER_ID } });
  const allTx = await prisma.coinTransaction.findMany({
    where: { userId: USER_ID },
    orderBy: { createdAt: 'asc' },
  });
  const referralsMade = await prisma.referral.findMany({
    where: { referrerUserId: USER_ID },
  });
  const referredAs = await prisma.referral.findMany({
    where: { referredUserId: USER_ID },
  });
  const redemptions = await prisma.redemptionRequest.findMany({
    where: { userId: USER_ID },
  });
  const user = await prisma.user.findUnique({
    where: { id: USER_ID },
    select: { id: true, email: true, name: true, referralCode: true },
  });

  console.log(JSON.stringify({ user, wallet, allTx, referralsMade, referredAs, redemptions }, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
