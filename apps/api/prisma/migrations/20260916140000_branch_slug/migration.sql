-- Branch public slug for customer-web routing

ALTER TABLE "Branch" ADD COLUMN IF NOT EXISTS "slug" TEXT;

WITH normalized AS (
  SELECT
    id,
    NULLIF(
      regexp_replace(
        regexp_replace(lower(trim("branchName")), '[^a-z0-9]+', '-', 'g'),
        '(^-+|-+$)',
        '',
        'g'
      ),
      ''
    ) AS base_slug,
    lower(trim("branchCode")) AS code_slug,
    "createdAt"
  FROM "Branch"
),
ranked AS (
  SELECT
    id,
    COALESCE(base_slug, code_slug, 'branch') AS base_slug,
    row_number() OVER (
      PARTITION BY COALESCE(base_slug, code_slug, 'branch')
      ORDER BY "createdAt", id
    ) AS rn
  FROM normalized
)
UPDATE "Branch" b
SET "slug" = CASE
  WHEN r.rn = 1 THEN r.base_slug
  ELSE r.base_slug || '-' || r.rn
END
FROM ranked r
WHERE b.id = r.id
  AND b."slug" IS NULL;

ALTER TABLE "Branch" ALTER COLUMN "slug" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "Branch_slug_key" ON "Branch"("slug");
