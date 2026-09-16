-- CreateTable
CREATE TABLE "CourseLearnItem" (
    "id" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "imageUrl" TEXT,
    "keyLearningPoints" TEXT,
    "finalThoughts" TEXT,
    "summary" TEXT,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseLearnItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseLearnItem_lessonId_idx" ON "CourseLearnItem"("lessonId");

-- CreateIndex
CREATE INDEX "CourseLearnItem_displayOrder_idx" ON "CourseLearnItem"("displayOrder");

-- CreateIndex
CREATE INDEX "CourseLearnItem_createdAt_idx" ON "CourseLearnItem"("createdAt");

-- AddForeignKey
ALTER TABLE "CourseLearnItem" ADD CONSTRAINT "CourseLearnItem_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "CourseLesson"("id") ON DELETE CASCADE ON UPDATE CASCADE;
