-- Allow admin to assign Branch + Interviewer before the branch schedules details.

ALTER TYPE "InterviewStatus" ADD VALUE 'ASSIGNED';

ALTER TABLE "Interview"
ALTER COLUMN "scheduledAt" DROP NOT NULL;

ALTER TABLE "Interview"
ALTER COLUMN "mode" DROP NOT NULL;
