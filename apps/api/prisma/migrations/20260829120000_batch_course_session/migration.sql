-- CreateTable
CREATE TABLE "BatchCourseSession" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "batchCourseId" TEXT NOT NULL,
    "sessionNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchCourseSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BatchCourseSession_batchCourseId_key" ON "BatchCourseSession"("batchCourseId");

-- CreateIndex
CREATE INDEX "BatchCourseSession_batchId_idx" ON "BatchCourseSession"("batchId");

-- CreateIndex
CREATE UNIQUE INDEX "BatchCourseSession_batchId_sessionNumber_key" ON "BatchCourseSession"("batchId", "sessionNumber");

-- AddForeignKey
ALTER TABLE "BatchCourseSession" ADD CONSTRAINT "BatchCourseSession_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCourseSession" ADD CONSTRAINT "BatchCourseSession_batchCourseId_fkey" FOREIGN KEY ("batchCourseId") REFERENCES "BatchCourse"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill: one stable session per existing BatchCourse, numbered by createdAt within each batch.
WITH ordered AS (
  SELECT
    bc."id" AS "batchCourseId",
    bc."batchId",
    ROW_NUMBER() OVER (
      PARTITION BY bc."batchId"
      ORDER BY bc."createdAt" ASC, bc."id" ASC
    ) AS "sessionNumber"
  FROM "BatchCourse" bc
  WHERE NOT EXISTS (
    SELECT 1
    FROM "BatchCourseSession" s
    WHERE s."batchCourseId" = bc."id"
  )
)
INSERT INTO "BatchCourseSession" ("id", "batchId", "batchCourseId", "sessionNumber", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  ordered."batchId",
  ordered."batchCourseId",
  ordered."sessionNumber"::integer,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM ordered;
