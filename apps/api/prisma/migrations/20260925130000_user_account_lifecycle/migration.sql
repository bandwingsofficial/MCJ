-- AlterTable
ALTER TABLE "User" ADD COLUMN "suspendedAt" TIMESTAMP(3),
ADD COLUMN "suspendedByUserId" TEXT,
ADD COLUMN "suspensionReason" TEXT,
ADD COLUMN "deletedByUserId" TEXT,
ADD COLUMN "deletionReason" TEXT,
ADD COLUMN "deletionSource" TEXT;

-- CreateIndex
CREATE INDEX "User_suspendedAt_idx" ON "User"("suspendedAt");

-- CreateTable
CREATE TABLE "UserDeletionRecord" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalEmailNormalized" TEXT NOT NULL,
    "originalPhone" TEXT,
    "deletedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deletedByUserId" TEXT,
    "deletionReason" TEXT,
    "deletionSource" TEXT,

    CONSTRAINT "UserDeletionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserDeletionRecord_userId_key" ON "UserDeletionRecord"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserDeletionRecord_originalEmailNormalized_key" ON "UserDeletionRecord"("originalEmailNormalized");

-- CreateIndex
CREATE UNIQUE INDEX "UserDeletionRecord_originalPhone_key" ON "UserDeletionRecord"("originalPhone");

-- CreateIndex
CREATE INDEX "UserDeletionRecord_deletedAt_idx" ON "UserDeletionRecord"("deletedAt");

-- AddForeignKey
ALTER TABLE "UserDeletionRecord" ADD CONSTRAINT "UserDeletionRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
