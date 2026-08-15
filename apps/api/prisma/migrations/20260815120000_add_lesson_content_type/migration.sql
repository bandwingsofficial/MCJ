-- CreateEnum
CREATE TYPE "LessonContentType" AS ENUM ('LESSON', 'SELF_PACED_VIDEO', 'LIVE_RECORDED_VIDEO');

-- AlterTable
ALTER TABLE "CourseLesson" ADD COLUMN "contentType" "LessonContentType" NOT NULL DEFAULT 'LESSON';

-- Backfill existing video lessons as self-paced videos
UPDATE "CourseLesson"
SET "contentType" = 'SELF_PACED_VIDEO'
WHERE "videoUrl" IS NOT NULL AND TRIM("videoUrl") <> '';
