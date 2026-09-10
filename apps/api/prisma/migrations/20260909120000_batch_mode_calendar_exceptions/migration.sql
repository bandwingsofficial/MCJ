-- CreateEnum
CREATE TYPE "BatchCalendarExceptionStatus" AS ENUM ('HOLIDAY', 'NON_WORKING', 'WORKING');

-- CreateTable
CREATE TABLE "BatchModeCalendarException" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "mode" "CourseMode" NOT NULL,
    "date" DATE NOT NULL,
    "status" "BatchCalendarExceptionStatus" NOT NULL,
    "reason" TEXT,
    "createdBy" TEXT,
    "updatedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BatchModeCalendarException_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BatchModeCalendarException_batchId_mode_idx" ON "BatchModeCalendarException"("batchId", "mode");

-- CreateIndex
CREATE UNIQUE INDEX "BatchModeCalendarException_batchId_mode_date_key" ON "BatchModeCalendarException"("batchId", "mode", "date");

-- AddForeignKey
ALTER TABLE "BatchModeCalendarException" ADD CONSTRAINT "BatchModeCalendarException_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
