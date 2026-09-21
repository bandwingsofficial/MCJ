-- Add UNDER_REVIEW + rejectionReason; allow reapply after reject.

ALTER TYPE "JobApplicationStatus" ADD VALUE IF NOT EXISTS 'UNDER_REVIEW';

ALTER TABLE "JobApplication"
ADD COLUMN IF NOT EXISTS "rejectionReason" TEXT;

DROP INDEX IF EXISTS "JobApplication_jobId_studentId_key";

CREATE INDEX IF NOT EXISTS "JobApplication_jobId_studentId_idx"
ON "JobApplication"("jobId", "studentId");
