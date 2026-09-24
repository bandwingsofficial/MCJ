-- Link branch staff accounts to trainers by ID (not email/phone heuristics).

ALTER TABLE "BranchUser" ADD COLUMN IF NOT EXISTS "linkedTrainerId" TEXT;

CREATE INDEX IF NOT EXISTS "BranchUser_linkedTrainerId_idx"
ON "BranchUser"("linkedTrainerId");

CREATE INDEX IF NOT EXISTS "BranchUser_branchId_linkedTrainerId_idx"
ON "BranchUser"("branchId", "linkedTrainerId");

ALTER TABLE "BranchUser" DROP CONSTRAINT IF EXISTS "BranchUser_linkedTrainerId_fkey";

ALTER TABLE "BranchUser"
ADD CONSTRAINT "BranchUser_linkedTrainerId_fkey"
FOREIGN KEY ("linkedTrainerId") REFERENCES "Trainer"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill from branch assignment + legacy email/phone match (one-time).
UPDATE "BranchUser" AS bu
SET "linkedTrainerId" = matched."trainerId"
FROM (
  SELECT DISTINCT ON (bu_inner."id")
    bu_inner."id" AS "branchUserId",
    bt."trainerId" AS "trainerId"
  FROM "BranchUser" bu_inner
  INNER JOIN "BranchTrainer" bt ON bt."branchId" = bu_inner."branchId"
  INNER JOIN "Trainer" t ON t."id" = bt."trainerId"
  WHERE bu_inner."isDeleted" = false
    AND bu_inner."linkedTrainerId" IS NULL
    AND t."isDeleted" = false
    AND (
      (
        bu_inner."email" IS NOT NULL
        AND t."email" IS NOT NULL
        AND LOWER(TRIM(bu_inner."email")) = LOWER(TRIM(t."email"))
      )
      OR (
        bu_inner."phone" IS NOT NULL
        AND t."phone" IS NOT NULL
        AND TRIM(bu_inner."phone") = TRIM(t."phone")
      )
    )
  ORDER BY bu_inner."id", bt."createdAt" DESC
) AS matched
WHERE bu."id" = matched."branchUserId";
