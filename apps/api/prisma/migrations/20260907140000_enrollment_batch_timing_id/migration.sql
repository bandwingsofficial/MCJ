-- Link enrollments to a specific batch timing within the parent batch.
ALTER TABLE "Enrollment" ADD COLUMN "batchTimingId" TEXT;

CREATE INDEX "Enrollment_batchTimingId_idx" ON "Enrollment"("batchTimingId");

ALTER TABLE "Enrollment"
ADD CONSTRAINT "Enrollment_batchTimingId_fkey"
FOREIGN KEY ("batchTimingId") REFERENCES "BatchTiming"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
