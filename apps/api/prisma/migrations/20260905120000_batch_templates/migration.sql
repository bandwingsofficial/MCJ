-- CreateTable
CREATE TABLE "BatchTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mode" "CourseMode" NOT NULL DEFAULT 'OFFLINE',
    "daysOfWeek" "DayOfWeek"[] DEFAULT ARRAY[]::"DayOfWeek"[],
    "startTime" TEXT,
    "endTime" TEXT,
    "hasFixedTime" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchTemplate_name_idx" ON "BatchTemplate"("name");

-- CreateIndex
CREATE INDEX "BatchTemplate_isActive_idx" ON "BatchTemplate"("isActive");

-- CreateIndex
CREATE INDEX "BatchTemplate_displayOrder_idx" ON "BatchTemplate"("displayOrder");

-- CreateIndex
CREATE INDEX "BatchTemplate_createdAt_idx" ON "BatchTemplate"("createdAt");

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN "batchTemplateId" TEXT;

-- CreateIndex
CREATE INDEX "Batch_batchTemplateId_idx" ON "Batch"("batchTemplateId");

-- AddForeignKey
ALTER TABLE "Batch" ADD CONSTRAINT "Batch_batchTemplateId_fkey" FOREIGN KEY ("batchTemplateId") REFERENCES "BatchTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
