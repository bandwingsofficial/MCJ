-- Fix batch-derived CourseBranch rows incorrectly marked manual by 20260922130000.

ALTER TABLE "CourseBranch"
ADD COLUMN "manualAssignedAt" TIMESTAMP(3);

UPDATE "CourseBranch"
SET "linkedViaManual" = false
WHERE "linkedViaBatch" = true;

-- Remove course links that are not backed by an assigned batch or explicit manual assign.
DELETE FROM "CourseBranch" AS cb
WHERE cb."manualAssignedAt" IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM "BranchBatch" AS bb
    INNER JOIN "Batch" AS b ON b."id" = bb."batchId"
    WHERE bb."branchId" = cb."branchId"
      AND (
        (b."courseId" IS NOT NULL AND b."courseId" = cb."courseId")
        OR EXISTS (
          SELECT 1
          FROM "BatchCourse" AS bc
          WHERE bc."batchId" = b."id"
            AND bc."courseId" = cb."courseId"
            AND bc."isDeleted" = false
        )
      )
  );
