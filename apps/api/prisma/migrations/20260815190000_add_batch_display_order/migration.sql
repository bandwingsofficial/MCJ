-- Add displayOrder for Batch drag-and-drop ordering.

ALTER TABLE "Batch" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER;

CREATE INDEX IF NOT EXISTS "Batch_displayOrder_idx" ON "Batch"("displayOrder");

-- Backfill sequential order for currently active, non-deleted batches.
WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, id ASC) AS rn
  FROM "Batch"
  WHERE "isDeleted" = false
    AND "isActive" = true
)
UPDATE "Batch" AS b
SET "displayOrder" = ordered.rn
FROM ordered
WHERE b.id = ordered.id;
