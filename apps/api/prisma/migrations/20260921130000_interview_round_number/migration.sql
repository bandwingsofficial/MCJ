-- Interview round number for scheduled interviews.

ALTER TABLE "Interview"
ADD COLUMN IF NOT EXISTS "roundNumber" INTEGER NOT NULL DEFAULT 1;
