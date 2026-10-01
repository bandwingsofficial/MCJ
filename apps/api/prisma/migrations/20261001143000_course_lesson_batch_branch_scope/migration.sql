-- Batch-scoped live recorded videos (child CourseLesson rows).

ALTER TABLE "CourseLesson" ADD COLUMN "branchId" TEXT;
ALTER TABLE "CourseLesson" ADD COLUMN "batchId" TEXT;

CREATE INDEX "CourseLesson_branchId_idx" ON "CourseLesson"("branchId");
CREATE INDEX "CourseLesson_batchId_idx" ON "CourseLesson"("batchId");
CREATE INDEX "CourseLesson_batchId_branchId_idx" ON "CourseLesson"("batchId", "branchId");

ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

DROP INDEX IF EXISTS "CourseLesson_moduleId_parentLessonId_slug_key";

CREATE UNIQUE INDEX "CourseLesson_moduleId_parentLessonId_slug_legacy_key"
ON "CourseLesson" ("moduleId", "parentLessonId", "slug")
WHERE "parentLessonId" IS NOT NULL AND "batchId" IS NULL;

CREATE UNIQUE INDEX "CourseLesson_moduleId_parentLessonId_batchId_slug_key"
ON "CourseLesson" ("moduleId", "parentLessonId", "batchId", "slug")
WHERE "parentLessonId" IS NOT NULL AND "batchId" IS NOT NULL;
