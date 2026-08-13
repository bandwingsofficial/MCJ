-- Global Category + multi-branch BranchCategory join

-- 1) Create BranchCategory join table
CREATE TABLE IF NOT EXISTS "BranchCategory" (
  "id" TEXT NOT NULL,
  "branchId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "BranchCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "BranchCategory_branchId_categoryId_key"
ON "BranchCategory"("branchId", "categoryId");

CREATE INDEX IF NOT EXISTS "BranchCategory_branchId_idx"
ON "BranchCategory"("branchId");

CREATE INDEX IF NOT EXISTS "BranchCategory_categoryId_idx"
ON "BranchCategory"("categoryId");

-- 2) Migrate existing Category.branchId assignments (preserve data)
INSERT INTO "BranchCategory" ("id", "branchId", "categoryId", "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  c."branchId",
  c."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "Category" c
WHERE c."branchId" IS NOT NULL
ON CONFLICT ("branchId", "categoryId") DO NOTHING;

-- 3) Drop old per-branch uniqueness / FK / indexes on Category.branchId
DROP INDEX IF EXISTS "Category_name_branch_ci_unique";
DROP INDEX IF EXISTS "Category_slug_branchId_key";
DROP INDEX IF EXISTS "Category_branchId_idx";
DROP INDEX IF EXISTS "Category_branchId_status_isDeleted_idx";

ALTER TABLE "Category" DROP CONSTRAINT IF EXISTS "Category_branchId_fkey";

-- 4) Remove Category.branchId column
ALTER TABLE "Category" DROP COLUMN IF EXISTS "branchId";

-- 5) Enforce global slug uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");

-- 6) Enforce global case-insensitive unique category names
CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_ci_unique"
ON "Category" (
  LOWER(TRIM(REGEXP_REPLACE(name, '\s+', ' ', 'g')))
);

-- 7) FKs for BranchCategory
ALTER TABLE "BranchCategory"
  DROP CONSTRAINT IF EXISTS "BranchCategory_branchId_fkey";
ALTER TABLE "BranchCategory"
  ADD CONSTRAINT "BranchCategory_branchId_fkey"
  FOREIGN KEY ("branchId") REFERENCES "Branch"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "BranchCategory"
  DROP CONSTRAINT IF EXISTS "BranchCategory_categoryId_fkey";
ALTER TABLE "BranchCategory"
  ADD CONSTRAINT "BranchCategory_categoryId_fkey"
  FOREIGN KEY ("categoryId") REFERENCES "Category"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
