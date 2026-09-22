-- Distinguish manual Branch → Category links from course/batch-derived duplicates.

ALTER TABLE "BranchCategory"
ADD COLUMN "linkedViaManual" BOOLEAN NOT NULL DEFAULT false;

-- Manual-only: category on branch with no course on that branch using the same categoryId.
UPDATE "BranchCategory" AS bc
SET "linkedViaManual" = true
WHERE NOT EXISTS (
  SELECT 1
  FROM "CourseBranch" AS cb
  INNER JOIN "Course" AS c ON c."id" = cb."courseId"
  WHERE cb."branchId" = bc."branchId"
    AND c."categoryId" = bc."categoryId"
    AND c."isDeleted" = false
);

-- Rows that mirror course-derived categories are not manual assignments.
UPDATE "BranchCategory" AS bc
SET "linkedViaManual" = false
WHERE EXISTS (
  SELECT 1
  FROM "CourseBranch" AS cb
  INNER JOIN "Course" AS c ON c."id" = cb."courseId"
  WHERE cb."branchId" = bc."branchId"
    AND c."categoryId" = bc."categoryId"
    AND c."isDeleted" = false
);
