-- Enforce case-insensitive, whitespace-normalized unique category names per branch.
-- COALESCE handles NULL branchId (global/admin categories) for uniqueness.

CREATE UNIQUE INDEX IF NOT EXISTS "Category_name_branch_ci_unique"
ON "Category" (
  LOWER(TRIM(REGEXP_REPLACE(name, '\s+', ' ', 'g'))),
  COALESCE("branchId", '00000000-0000-0000-0000-000000000000')
);
