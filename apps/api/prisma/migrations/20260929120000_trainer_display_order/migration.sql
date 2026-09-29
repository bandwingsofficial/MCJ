-- Add displayOrder for Trainer drag-and-drop ordering (Branch/Categories parity).

ALTER TABLE "Trainer" ADD COLUMN IF NOT EXISTS "displayOrder" INTEGER;

CREATE INDEX IF NOT EXISTS "Trainer_displayOrder_idx" ON "Trainer"("displayOrder");

-- Backfill sequential order for non-deleted trainers (stable fallback for reorder UI).
WITH ordered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, id ASC) AS rn
  FROM "Trainer"
  WHERE "isDeleted" = false
)
UPDATE "Trainer" AS t
SET "displayOrder" = ordered.rn
FROM ordered
WHERE t.id = ordered.id
  AND t."displayOrder" IS NULL;
