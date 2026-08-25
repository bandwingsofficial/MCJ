-- AlterTable
ALTER TABLE "Batch" ALTER COLUMN "courseId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "BatchCourse" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "trainerId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchCourse_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchCourse_batchId_idx" ON "BatchCourse"("batchId");

-- CreateIndex
CREATE INDEX "BatchCourse_courseId_idx" ON "BatchCourse"("courseId");

-- CreateIndex
CREATE INDEX "BatchCourse_trainerId_idx" ON "BatchCourse"("trainerId");

-- CreateIndex
CREATE INDEX "BatchCourse_isDeleted_idx" ON "BatchCourse"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "BatchCourse_batchId_courseId_key" ON "BatchCourse"("batchId", "courseId");

-- AddForeignKey
ALTER TABLE "BatchCourse" ADD CONSTRAINT "BatchCourse_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCourse" ADD CONSTRAINT "BatchCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BatchCourse" ADD CONSTRAINT "BatchCourse_trainerId_fkey" FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
