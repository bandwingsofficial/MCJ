-- AlterTable
ALTER TABLE "CourseLesson" ADD COLUMN "parentLessonId" TEXT;

-- CreateIndex
CREATE INDEX "CourseLesson_parentLessonId_idx" ON "CourseLesson"("parentLessonId");

-- AddForeignKey
ALTER TABLE "CourseLesson" ADD CONSTRAINT "CourseLesson_parentLessonId_fkey" FOREIGN KEY ("parentLessonId") REFERENCES "CourseLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
