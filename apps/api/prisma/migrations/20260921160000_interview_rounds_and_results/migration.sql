-- Configurable interview rounds + interview result / round FK

CREATE TYPE "InterviewResult" AS ENUM (
  'PENDING',
  'SELECTED_FOR_NEXT_ROUND',
  'REJECTED',
  'ON_HOLD',
  'NEED_FURTHER_REVIEW'
);

CREATE TYPE "InterviewRoundStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "InterviewRound" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "sortOrder" INTEGER NOT NULL,
  "status" "InterviewRoundStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdBy" TEXT,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "InterviewRound_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "InterviewRound_name_key" ON "InterviewRound"("name");
CREATE INDEX "InterviewRound_sortOrder_idx" ON "InterviewRound"("sortOrder");
CREATE INDEX "InterviewRound_status_idx" ON "InterviewRound"("status");
CREATE INDEX "InterviewRound_name_idx" ON "InterviewRound"("name");

ALTER TABLE "Interview"
ADD COLUMN IF NOT EXISTS "roundId" TEXT,
ADD COLUMN IF NOT EXISTS "result" "InterviewResult" NOT NULL DEFAULT 'PENDING';

CREATE INDEX IF NOT EXISTS "Interview_roundId_idx" ON "Interview"("roundId");
CREATE INDEX IF NOT EXISTS "Interview_result_idx" ON "Interview"("result");
CREATE INDEX IF NOT EXISTS "Interview_applicationId_roundNumber_idx" ON "Interview"("applicationId", "roundNumber");

ALTER TABLE "Interview"
ADD CONSTRAINT "Interview_roundId_fkey"
FOREIGN KEY ("roundId") REFERENCES "InterviewRound"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
