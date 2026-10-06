-- Module-level tests (quizzes) and module resources (production-safe backfill)

-- ─── CourseQuiz.moduleId ───────────────────────────────────────────────────

ALTER TABLE "CourseQuiz" ADD COLUMN IF NOT EXISTS "moduleId" TEXT;

UPDATE "CourseQuiz" AS q
SET "moduleId" = l."moduleId"
FROM "CourseLesson" AS l
WHERE l."id" = q."lessonId"
  AND q."moduleId" IS NULL;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "CourseQuiz" WHERE "moduleId" IS NULL) THEN
    RAISE EXCEPTION
      'CourseQuiz moduleId backfill failed: one or more quizzes have no matching lesson/module. Assign moduleId manually before retrying.';
  END IF;
END $$;

ALTER TABLE "CourseQuiz" ALTER COLUMN "moduleId" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CourseQuiz_moduleId_fkey'
  ) THEN
    ALTER TABLE "CourseQuiz"
      ADD CONSTRAINT "CourseQuiz_moduleId_fkey"
      FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "CourseQuiz_moduleId_idx" ON "CourseQuiz"("moduleId");

-- ─── CourseResource.moduleId (optional module-scoped resources) ─────────────

ALTER TABLE "CourseResource" ADD COLUMN IF NOT EXISTS "moduleId" TEXT;

ALTER TABLE "CourseResource" ALTER COLUMN "lessonId" DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'CourseResource_moduleId_fkey'
  ) THEN
    ALTER TABLE "CourseResource"
      ADD CONSTRAINT "CourseResource_moduleId_fkey"
      FOREIGN KEY ("moduleId") REFERENCES "CourseModule"("id")
      ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS "CourseResource_moduleId_idx" ON "CourseResource"("moduleId");
