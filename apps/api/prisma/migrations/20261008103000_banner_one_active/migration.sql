-- Keep the most recently updated active banner and deactivate any others.
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      ORDER BY "updatedAt" DESC, "createdAt" DESC, id DESC
    ) AS rn
  FROM "Banner"
  WHERE "status" = 'ACTIVE'
)
UPDATE "Banner"
SET "status" = 'INACTIVE'
WHERE id IN (
  SELECT id FROM ranked WHERE rn > 1
);

CREATE UNIQUE INDEX "Banner_one_active_idx"
ON "Banner" ((1))
WHERE "status" = 'ACTIVE';
