-- AlterTable
ALTER TABLE "BatchTemplate" ADD COLUMN IF NOT EXISTS "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "BatchTemplate" ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);
ALTER TABLE "BatchTemplate" ADD COLUMN IF NOT EXISTS "deletedBy" TEXT;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "BatchTemplate_isDeleted_idx" ON "BatchTemplate"("isDeleted");
