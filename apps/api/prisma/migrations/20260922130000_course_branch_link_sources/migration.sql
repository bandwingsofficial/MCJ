-- Distinguish manual Branch → Course links from batch-derived links.

ALTER TABLE "CourseBranch"
ADD COLUMN "linkedViaManual" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "linkedViaBatch" BOOLEAN NOT NULL DEFAULT false;

-- Historical rows were created via manual course assignment or course create/update.
UPDATE "CourseBranch" SET "linkedViaManual" = true;

-- Backfill batch-derived flags from existing BranchBatch assignments.
UPDATE "CourseBranch" AS cb
SET "linkedViaBatch" = true
FROM "BranchBatch" AS bb
INNER JOIN "Batch" AS b ON b."id" = bb."batchId"
WHERE cb."branchId" = bb."branchId"
  AND (
    (b."courseId" IS NOT NULL AND cb."courseId" = b."courseId")
    OR EXISTS (
      SELECT 1
      FROM "BatchCourse" AS bc
      WHERE bc."batchId" = b."id"
        AND bc."courseId" = cb."courseId"
        AND bc."isDeleted" = false
    )
  );

-- Create missing CourseBranch rows for courses linked only via assigned batches.
INSERT INTO "CourseBranch" ("courseId", "branchId", "linkedViaManual", "linkedViaBatch")
SELECT DISTINCT b."courseId", bb."branchId", false, true
FROM "BranchBatch" AS bb
INNER JOIN "Batch" AS b ON b."id" = bb."batchId"
INNER JOIN "Course" AS c ON c."id" = b."courseId" AND c."isDeleted" = false
WHERE b."courseId" IS NOT NULL
ON CONFLICT ("courseId", "branchId") DO UPDATE
SET "linkedViaBatch" = true;

INSERT INTO "CourseBranch" ("courseId", "branchId", "linkedViaManual", "linkedViaBatch")
SELECT DISTINCT bc."courseId", bb."branchId", false, true
FROM "BranchBatch" AS bb
INNER JOIN "BatchCourse" AS bc ON bc."batchId" = bb."batchId" AND bc."isDeleted" = false
INNER JOIN "Course" AS c ON c."id" = bc."courseId" AND c."isDeleted" = false
ON CONFLICT ("courseId", "branchId") DO UPDATE
SET "linkedViaBatch" = true;
