-- BranchBatch join: independent branch ↔ batch assignments
-- Uniqueness is (branchId, batchId) so the same parent batch can be assigned to many branches.

CREATE TABLE IF NOT EXISTS "BranchBatch" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "batchId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BranchBatch_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BranchBatch_branchId_batchId_key"
ON "BranchBatch"("branchId", "batchId");

CREATE INDEX IF NOT EXISTS "BranchBatch_branchId_idx"
ON "BranchBatch"("branchId");

CREATE INDEX IF NOT EXISTS "BranchBatch_batchId_idx"
ON "BranchBatch"("batchId");

-- Migrate legacy Batch.branchId assignments
INSERT INTO "BranchBatch" ("id", "branchId", "batchId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  b."branchId",
  b."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Batch" b
WHERE b."branchId" IS NOT NULL
ON CONFLICT ("branchId", "batchId") DO NOTHING;

ALTER TABLE "BranchBatch"
  DROP CONSTRAINT IF EXISTS "BranchBatch_branchId_fkey";
ALTER TABLE "BranchBatch"
  ADD CONSTRAINT "BranchBatch_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BranchBatch"
  DROP CONSTRAINT IF EXISTS "BranchBatch_batchId_fkey";
ALTER TABLE "BranchBatch"
  ADD CONSTRAINT "BranchBatch_batchId_fkey"
  FOREIGN KEY ("batchId") REFERENCES "Batch"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
