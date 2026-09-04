-- Backfill Batch.courseId from the first non-deleted BatchCourse assignment.
-- Intentionally leaves courseId nullable (no NOT NULL / no BatchCourse drop).

UPDATE "Batch" AS b
SET "courseId" = bc."courseId"
FROM (
  SELECT DISTINCT ON ("batchId")
    "batchId",
    "courseId"
  FROM "BatchCourse"
  WHERE "isDeleted" = false
  ORDER BY "batchId", "createdAt" ASC
) AS bc
WHERE b."id" = bc."batchId"
  AND b."courseId" IS NULL;
