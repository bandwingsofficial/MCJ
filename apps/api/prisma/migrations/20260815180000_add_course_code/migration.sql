-- Add course code column with CR0001 format backfill
ALTER TABLE "Course" ADD COLUMN "code" TEXT;

WITH numbered AS (
  SELECT
    id,
    ROW_NUMBER() OVER (ORDER BY "createdAt", id) AS row_number
  FROM "Course"
)
UPDATE "Course"
SET "code" = 'CR' || LPAD(numbered.row_number::text, 4, '0')
FROM numbered
WHERE "Course".id = numbered.id;

ALTER TABLE "Course" ALTER COLUMN "code" SET NOT NULL;

CREATE UNIQUE INDEX "Course_code_key" ON "Course"("code");
CREATE INDEX "Course_code_idx" ON "Course"("code");
