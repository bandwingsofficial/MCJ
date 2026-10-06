-- AlterTable
ALTER TABLE "UserDeletionRecord" ADD COLUMN IF NOT EXISTS "originalEmail" TEXT;
ALTER TABLE "UserDeletionRecord" ADD COLUMN IF NOT EXISTS "originalName" TEXT;
