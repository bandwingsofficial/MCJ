/**
 * Idempotent backfill for RedemptionRequest rows missing from historical coin use.
 *
 * Usage (from apps/api):
 *   pnpm exec ts-node -r tsconfig-paths/register prisma/scripts/backfill-missing-redemptions.ts
 */
import { NestFactory } from '@nestjs/core';

import { RedemptionBackfillService } from '../../src/modules/referral-rewards/application/redemption-backfill.service';
import { AppModule } from '../../src/app.module';

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn', 'log'],
  });
  try {
    const backfill = app.get(RedemptionBackfillService);
    const result = await backfill.backfillMissingRedemptions();
    console.log('Backfill complete:', result);
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
