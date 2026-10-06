-- Email verification OTP challenges (idempotent for db push drift).

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EmailVerificationStatus') THEN
    CREATE TYPE "EmailVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'CONSUMED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "EmailVerificationChallenge" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otpHash" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "status" "EmailVerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastSentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "requestedFromIp" TEXT,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmailVerificationChallenge_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "EmailVerificationChallenge_email_idx" ON "EmailVerificationChallenge"("email");
CREATE INDEX IF NOT EXISTS "EmailVerificationChallenge_email_status_idx" ON "EmailVerificationChallenge"("email", "status");
CREATE INDEX IF NOT EXISTS "EmailVerificationChallenge_expiresAt_idx" ON "EmailVerificationChallenge"("expiresAt");
CREATE INDEX IF NOT EXISTS "EmailVerificationChallenge_createdAt_idx" ON "EmailVerificationChallenge"("createdAt");

UPDATE "User" SET "isEmailVerified" = true WHERE "isEmailVerified" = false;
