-- Move course-level pricing onto Batch.

-- 1. Add pricing columns to Batch
ALTER TABLE "Batch" ADD COLUMN "originalPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Batch" ADD COLUMN "discountAmount" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Batch" ADD COLUMN "discountedPrice" DECIMAL(12,2) NOT NULL DEFAULT 0;
ALTER TABLE "Batch" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'INR';
ALTER TABLE "Batch" ADD COLUMN "isFree" BOOLEAN NOT NULL DEFAULT false;

-- 2a. Copy pricing from Course via Batch.courseId
UPDATE "Batch" AS b
SET
  "originalPrice" = c."originalPrice",
  "discountAmount" = c."discountAmount",
  "discountedPrice" = c."discountedPrice",
  "currency" = c."currency",
  "isFree" = c."isFree"
FROM "Course" AS c
WHERE b."courseId" = c."id";

-- 2b. When Batch.courseId is null, copy from the first BatchCourse join
UPDATE "Batch" AS b
SET
  "originalPrice" = c."originalPrice",
  "discountAmount" = c."discountAmount",
  "discountedPrice" = c."discountedPrice",
  "currency" = c."currency",
  "isFree" = c."isFree"
FROM (
  SELECT DISTINCT ON ("batchId")
    "batchId",
    "courseId"
  FROM "BatchCourse"
  WHERE "isDeleted" = false
  ORDER BY "batchId", "createdAt" ASC
) AS bc
JOIN "Course" AS c ON c."id" = bc."courseId"
WHERE b."id" = bc."batchId"
  AND b."courseId" IS NULL;

-- 3. Drop pricing columns from Course
ALTER TABLE "Course" DROP COLUMN "originalPrice";
ALTER TABLE "Course" DROP COLUMN "discountAmount";
ALTER TABLE "Course" DROP COLUMN "discountedPrice";
ALTER TABLE "Course" DROP COLUMN "currency";
ALTER TABLE "Course" DROP COLUMN "isFree";
