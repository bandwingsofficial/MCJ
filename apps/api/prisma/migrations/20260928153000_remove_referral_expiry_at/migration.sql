-- Referral availability is controlled by referralEnabled only (no expiry fields).

ALTER TABLE "ReferralRewardSettings" DROP COLUMN IF EXISTS "referralExpiryAt";
ALTER TABLE "ReferralRewardSettings" DROP COLUMN IF EXISTS "referralExpiryDays";
