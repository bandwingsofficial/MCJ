-- AlterTable
ALTER TABLE "ReferralRewardSettings" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT 'Default Rewards';
ALTER TABLE "ReferralRewardSettings" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ReferralRewardSettings" ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

UPDATE "ReferralRewardSettings"
SET "name" = 'Default Rewards', "isActive" = true
WHERE "id" = 'default';

UPDATE "ReferralRewardSettings"
SET "isActive" = true
WHERE "isActive" = false
  AND NOT EXISTS (SELECT 1 FROM "ReferralRewardSettings" WHERE "isActive" = true);
