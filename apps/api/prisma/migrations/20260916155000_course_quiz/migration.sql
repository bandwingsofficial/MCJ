-- CreateEnum
CREATE TYPE "QuizQuestionType" AS ENUM (
    'MULTIPLE_CHOICE',
    'TRUE_FALSE',
    'MULTIPLE_SELECT'
);

-- CreateEnum
CREATE TYPE "QuizStatus" AS ENUM (
    'DRAFT',
    'PUBLISHED'
);

-- CreateTable
CREATE TABLE "CourseQuiz" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" "QuizStatus" NOT NULL DEFAULT 'DRAFT',
    "passingScore" INTEGER,
    "timeLimitMinutes" INTEGER,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseQuiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseQuizQuestion" (
    "id" TEXT NOT NULL,
    "quizId" TEXT NOT NULL,
    "questionText" TEXT NOT NULL,
    "type" "QuizQuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE',
    "explanation" TEXT,
    "points" INTEGER NOT NULL DEFAULT 1,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseQuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseQuizOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionText" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CourseQuizOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CourseQuiz_lessonId_key"
ON "CourseQuiz"("lessonId");

CREATE INDEX "CourseQuiz_lessonId_idx"
ON "CourseQuiz"("lessonId");

CREATE INDEX "CourseQuiz_isDeleted_idx"
ON "CourseQuiz"("isDeleted");

CREATE INDEX "CourseQuiz_status_idx"
ON "CourseQuiz"("status");

CREATE INDEX "CourseQuiz_displayOrder_idx"
ON "CourseQuiz"("displayOrder");

CREATE INDEX "CourseQuiz_createdAt_idx"
ON "CourseQuiz"("createdAt");

-- CreateIndex
CREATE INDEX "CourseQuizQuestion_quizId_idx"
ON "CourseQuizQuestion"("quizId");

CREATE INDEX "CourseQuizQuestion_displayOrder_idx"
ON "CourseQuizQuestion"("displayOrder");

-- CreateIndex
CREATE INDEX "CourseQuizOption_questionId_idx"
ON "CourseQuizOption"("questionId");

CREATE INDEX "CourseQuizOption_displayOrder_idx"
ON "CourseQuizOption"("displayOrder");

-- AddForeignKey
ALTER TABLE "CourseQuiz"
ADD CONSTRAINT "CourseQuiz_lessonId_fkey"
FOREIGN KEY ("lessonId")
REFERENCES "CourseLesson"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuizQuestion"
ADD CONSTRAINT "CourseQuizQuestion_quizId_fkey"
FOREIGN KEY ("quizId")
REFERENCES "CourseQuiz"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseQuizOption"
ADD CONSTRAINT "CourseQuizOption_questionId_fkey"
FOREIGN KEY ("questionId")
REFERENCES "CourseQuizQuestion"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;