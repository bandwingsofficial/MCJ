-- BranchTrainer join: independent branch ↔ trainer assignments

CREATE TABLE IF NOT EXISTS "BranchTrainer" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "trainerId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BranchTrainer_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BranchTrainer_branchId_trainerId_key"
ON "BranchTrainer"("branchId", "trainerId");

CREATE INDEX IF NOT EXISTS "BranchTrainer_branchId_idx"
ON "BranchTrainer"("branchId");

CREATE INDEX IF NOT EXISTS "BranchTrainer_trainerId_idx"
ON "BranchTrainer"("trainerId");

-- Migrate legacy Trainer.branchId assignments
INSERT INTO "BranchTrainer" ("id", "branchId", "trainerId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  t."branchId",
  t."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Trainer" t
WHERE t."branchId" IS NOT NULL
ON CONFLICT ("branchId", "trainerId") DO NOTHING;

-- Migrate course trainers into branch trainers where course is assigned to branch
INSERT INTO "BranchTrainer" ("id", "branchId", "trainerId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  cb."branchId",
  tc."trainerId",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "TrainerCourse" tc
INNER JOIN "CourseBranch" cb ON cb."courseId" = tc."courseId"
ON CONFLICT ("branchId", "trainerId") DO NOTHING;

ALTER TABLE "BranchTrainer"
  DROP CONSTRAINT IF EXISTS "BranchTrainer_branchId_fkey";
ALTER TABLE "BranchTrainer"
  ADD CONSTRAINT "BranchTrainer_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BranchTrainer"
  DROP CONSTRAINT IF EXISTS "BranchTrainer_trainerId_fkey";
ALTER TABLE "BranchTrainer"
  ADD CONSTRAINT "BranchTrainer_trainerId_fkey"
  FOREIGN KEY ("trainerId") REFERENCES "Trainer"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
