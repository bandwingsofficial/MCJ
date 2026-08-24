-- CreateTable
CREATE TABLE "CourseFaq" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseFaq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseFaq_courseId_idx" ON "CourseFaq"("courseId");

-- CreateIndex
CREATE INDEX "CourseFaq_displayOrder_idx" ON "CourseFaq"("displayOrder");

-- CreateIndex
CREATE INDEX "CourseFaq_courseId_displayOrder_idx" ON "CourseFaq"("courseId", "displayOrder");

-- AddForeignKey
ALTER TABLE "CourseFaq" ADD CONSTRAINT "CourseFaq_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
