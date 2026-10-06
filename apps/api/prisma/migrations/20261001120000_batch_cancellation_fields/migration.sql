-- AlterTable (idempotent for DBs that already received these columns via db push)
ALTER TABLE "Batch" ADD COLUMN IF NOT EXISTS "cancellationReason" TEXT;
ALTER TABLE "Batch" ADD COLUMN IF NOT EXISTS "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Batch" ADD COLUMN IF NOT EXISTS "cancelledBy" TEXT;
