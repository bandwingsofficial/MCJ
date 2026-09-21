-- Persist selected next round on completed interviews (no auto-create).

ALTER TABLE "Interview"
ADD COLUMN IF NOT EXISTS "nextRoundId" TEXT;

CREATE INDEX IF NOT EXISTS "Interview_nextRoundId_idx" ON "Interview"("nextRoundId");

ALTER TABLE "Interview" DROP CONSTRAINT IF EXISTS "Interview_roundId_fkey";
ALTER TABLE "Interview" DROP CONSTRAINT IF EXISTS "Interview_nextRoundId_fkey";

ALTER TABLE "Interview"
ADD CONSTRAINT "Interview_roundId_fkey"
FOREIGN KEY ("roundId") REFERENCES "InterviewRound"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Interview"
ADD CONSTRAINT "Interview_nextRoundId_fkey"
FOREIGN KEY ("nextRoundId") REFERENCES "InterviewRound"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
