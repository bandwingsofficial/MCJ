-- AlterTable
ALTER TABLE "Batch" ADD COLUMN "cancellationReason" TEXT;
ALTER TABLE "Batch" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Batch" ADD COLUMN "cancelledBy" TEXT;
