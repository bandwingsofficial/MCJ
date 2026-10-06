-- Batch-scoped live recorded videos (child CourseLesson rows).
-- Idempotent for databases that partially applied this via db push.

ALTER TABLE "CourseLesson" ADD COLUMN IF NOT EXISTS "branchId" TEXT;
ALTER TABLE "CourseLesson" ADD COLUMN IF NOT EXISTS "batchId" TEXT;

CREATE INDEX IF NOT EXISTS "CourseLesson_branchId_idx" ON "CourseLesson"("branchId");
CREATE INDEX IF NOT EXISTS "CourseLesson_batchId_idx" ON "CourseLesson"("batchId");
CREATE INDEX IF NOT EXISTS "CourseLesson_batchId_branchId_idx" ON "CourseLesson"("batchId", "branchId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CourseLesson_branchId_fkey'
  ) THEN
    ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_branchId_fkey"
      FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CourseLesson_batchId_fkey'
  ) THEN
    ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_batchId_fkey"
      FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DROP INDEX IF EXISTS "CourseLesson_moduleId_parentLessonId_slug_key";

CREATE UNIQUE INDEX IF NOT EXISTS "CourseLesson_moduleId_parentLessonId_slug_legacy_key"
ON "CourseLesson" ("moduleId", "parentLessonId", "slug")
WHERE "parentLessonId" IS NOT NULL AND "batchId" IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "CourseLesson_moduleId_parentLessonId_batchId_slug_key"
ON "CourseLesson" ("moduleId", "parentLessonId", "batchId", "slug")
WHERE "parentLessonId" IS NOT NULL AND "batchId" IS NOT NULL;
