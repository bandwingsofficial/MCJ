-- Self-paced / live-recorded videos are child CourseLesson rows (parentLessonId set).
-- Slug uniqueness must be scoped per sibling group (module + parent), not module-wide.

DROP INDEX IF EXISTS "CourseLesson_moduleId_slug_key";

CREATE UNIQUE INDEX "CourseLesson_moduleId_slug_root_key"
ON "CourseLesson" ("moduleId", "slug")
WHERE "parentLessonId" IS NULL;

CREATE UNIQUE INDEX "CourseLesson_moduleId_parentLessonId_slug_key"
ON "CourseLesson" ("moduleId", "parentLessonId", "slug")
WHERE "parentLessonId" IS NOT NULL;
