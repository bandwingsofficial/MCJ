-- Add preview flag to lessons and lesson progress tracking
ALTER TABLE "CourseLesson" ADD COLUMN "isPreview" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "watchedSeconds" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "LessonProgress_studentId_lessonId_key" ON "LessonProgress"("studentId", "lessonId");
CREATE INDEX "LessonProgress_studentId_courseId_idx" ON "LessonProgress"("studentId", "courseId");
CREATE INDEX "LessonProgress_courseId_idx" ON "LessonProgress"("courseId");
CREATE INDEX "LessonProgress_lessonId_idx" ON "LessonProgress"("lessonId");

ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LessonProgress" ADD CONSTRAINT "LessonProgress_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CourseLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
