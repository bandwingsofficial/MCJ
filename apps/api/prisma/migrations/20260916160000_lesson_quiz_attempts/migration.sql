-- CreateTable
CREATE TABLE "LessonQuizAttempt" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "totalPoints" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,
    "passed" BOOLEAN NOT NULL,
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LessonQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonQuizAttempt_studentId_lessonId_idx" ON "LessonQuizAttempt"("studentId", "lessonId");

-- CreateIndex
CREATE INDEX "LessonQuizAttempt_studentId_quizId_idx" ON "LessonQuizAttempt"("studentId", "quizId");

-- CreateIndex
CREATE INDEX "LessonQuizAttempt_quizId_idx" ON "LessonQuizAttempt"("quizId");

-- CreateIndex
CREATE INDEX "LessonQuizAttempt_createdAt_idx" ON "LessonQuizAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "LessonQuizAttempt" ADD CONSTRAINT "LessonQuizAttempt_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LessonQuizAttempt" ADD CONSTRAINT "LessonQuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "CourseQuiz"("id") ON DELETE CASCADE ON UPDATE CASCADE;
