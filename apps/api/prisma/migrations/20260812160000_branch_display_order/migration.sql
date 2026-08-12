-- Add displayOrder for Branch drag-and-drop ordering (Categories parity).

ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER;

CREATE INDEX IF NOT EXISTS "Branch_displayOrder_idx" ON "Branch"("displayOrder");

-- Backfill sequential order for currently ACTIVE, non-deleted branches.
WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, id ASC) AS rn
  FROM "Branch"
  WHERE "deletedAt" IS NULL
    AND status = 'ACTIVE'
)
UPDATE "Branch" AS b
SET "displayOrder" = ordered.rn
FROM ordered
WHERE b.id = ordered.id;
