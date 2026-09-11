-- Add separate interview tracking on job applications.

CREATE TYPE "JobApplicationInterviewStatus" AS ENUM (
  'NOT_YET',
  'INTERVIEW_SCHEDULED',
  'INTERVIEWED',
  'SELECTED',
  'REJECTED',
  'PLACED'
);

ALTER TABLE "JobApplication"
ADD COLUMN "interviewStatus" "JobApplicationInterviewStatus" NOT NULL DEFAULT 'NOT_YET';

CREATE INDEX "JobApplication_interviewStatus_idx" ON "JobApplication"("interviewStatus");
