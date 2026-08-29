-- Scope attendance to a batch-course session (BatchCourse), not just batch+date.
-- Hierarchy: Branch → Batch → BatchCourse/Session → Enrolled Student → Attendance(date)

-- Step 1: add nullable column for backfill
ALTER TABLE "Attendance" ADD COLUMN IF NOT EXISTS "batchCourseId" TEXT;

-- Step 2: backfill from the earliest active BatchCourse in the same batch
UPDATE "Attendance" AS a
SET "batchCourseId" = src."batchCourseId"
FROM (
  SELECT DISTINCT ON (bc."batchId")
    bc."batchId",
    bc."id" AS "batchCourseId"
  FROM "BatchCourse" bc
  WHERE bc."isDeleted" = false
  ORDER BY bc."batchId", bc."createdAt" ASC, bc."id" ASC
) AS src
WHERE a."batchId" = src."batchId"
  AND a."batchCourseId" IS NULL;

-- Step 3: drop rows that cannot be linked to a batch course (orphan legacy data)
DELETE FROM "Attendance"
WHERE "batchCourseId" IS NULL;

-- Step 4: enforce NOT NULL
ALTER TABLE "Attendance" ALTER COLUMN "batchCourseId" SET NOT NULL;

-- Step 5: replace uniqueness (student+batch+date → student+session+date)
DROP INDEX IF EXISTS "Attendance_studentId_batchId_date_key";

CREATE UNIQUE INDEX "Attendance_studentId_batchCourseId_date_key"
  ON "Attendance"("studentId", "batchCourseId", "date");

CREATE INDEX "Attendance_batchCourseId_idx" ON "Attendance"("batchCourseId");
CREATE INDEX "Attendance_batchCourseId_date_idx" ON "Attendance"("batchCourseId", "date");

-- Step 6: FK to BatchCourse
ALTER TABLE "Attendance"
  ADD CONSTRAINT "Attendance_batchCourseId_fkey"
  FOREIGN KEY ("batchCourseId") REFERENCES "BatchCourse"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
