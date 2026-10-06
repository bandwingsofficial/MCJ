-- CreateEnum
CREATE TYPE "EmailVerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'CONSUMED');

-- CreateTable
CREATE TABLE "EmailVerificationChallenge" (
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

-- CreateIndex
CREATE INDEX "EmailVerificationChallenge_email_idx" ON "EmailVerificationChallenge"("email");

-- CreateIndex
CREATE INDEX "EmailVerificationChallenge_email_status_idx" ON "EmailVerificationChallenge"("email", "status");

-- CreateIndex
CREATE INDEX "EmailVerificationChallenge_expiresAt_idx" ON "EmailVerificationChallenge"("expiresAt");

-- CreateIndex
CREATE INDEX "EmailVerificationChallenge_createdAt_idx" ON "EmailVerificationChallenge"("createdAt");

-- Trust existing accounts (do not force re-verification on login).
UPDATE "User" SET "isEmailVerified" = true WHERE "isEmailVerified" = false;
