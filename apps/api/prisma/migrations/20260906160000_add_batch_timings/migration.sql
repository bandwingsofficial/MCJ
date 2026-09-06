-- CreateTable
CREATE TABLE "BatchTiming" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "batchTemplateId" TEXT,
    "name" TEXT NOT NULL,
    "mode" "CourseMode" NOT NULL DEFAULT 'OFFLINE',
    "daysOfWeek" "DayOfWeek"[] DEFAULT ARRAY[]::"DayOfWeek"[],
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 0,
    "enrolledCount" INTEGER NOT NULL DEFAULT 0,
    "status" "BatchStatus" NOT NULL DEFAULT 'UPCOMING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "displayOrder" INTEGER,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "deletedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchTiming_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchTiming_batchId_idx" ON "BatchTiming"("batchId");

-- CreateIndex
CREATE INDEX "BatchTiming_batchTemplateId_idx" ON "BatchTiming"("batchTemplateId");

-- CreateIndex
CREATE INDEX "BatchTiming_isDeleted_idx" ON "BatchTiming"("isDeleted");

-- CreateIndex
CREATE INDEX "BatchTiming_displayOrder_idx" ON "BatchTiming"("displayOrder");

-- AddForeignKey
ALTER TABLE "BatchTiming" ADD CONSTRAINT "BatchTiming_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchTiming" ADD CONSTRAINT "BatchTiming_batchTemplateId_fkey" FOREIGN KEY ("batchTemplateId") REFERENCES "BatchTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: every existing batch keeps its schedule as its first child timing,
-- so no batch is left without a timing after the hierarchy change.
INSERT INTO "BatchTiming" (
  "id",
  "batchId",
  "batchTemplateId",
  "name",
  "mode",
  "daysOfWeek",
  "startDate",
  "endDate",
  "startTime",
  "endTime",
  "capacity",
  "enrolledCount",
  "status",
  "isActive",
  "displayOrder",
  "createdBy",
  "createdAt",
  "updatedAt"
)
SELECT
  gen_random_uuid()::text,
  b."id",
  b."batchTemplateId",
  COALESCE(t."name", b."name"),
  b."mode",
  b."daysOfWeek",
  b."startDate",
  b."endDate",
  b."startTime",
  b."endTime",
  b."capacity",
  b."enrolledCount",
  b."status",
  b."isActive",
  1,
  b."createdBy",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Batch" b
LEFT JOIN "BatchTemplate" t ON t."id" = b."batchTemplateId"
WHERE NOT EXISTS (
  SELECT 1 FROM "BatchTiming" bt WHERE bt."batchId" = b."id"
);
