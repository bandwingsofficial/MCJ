-- Referral expiry: optional absolute timestamp (replaces unused relative days field).
-- Existing referralExpiryDays values are not converted to dates (days were never enforced in application logic).

ALTER TABLE "ReferralRewardSettings" ADD COLUMN IF NOT EXISTS "referralExpiryAt" TIMESTAMP(3);

ALTER TABLE "ReferralRewardSettings" DROP COLUMN IF EXISTS "referralExpiryDays";
