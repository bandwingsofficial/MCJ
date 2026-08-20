import { Prisma } from '@prisma/client';

export function toMoneyNumber(
  value: Prisma.Decimal | number | null | undefined,
): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const amount = Number(value);

  if (!Number.isFinite(amount) || amount < 0) {
    return 0;
  }

  return Math.round(amount * 100) / 100;
}
