-- Course mode: replace HYBRID with RECORDED
ALTER TYPE "CourseMode" ADD VALUE IF NOT EXISTS 'RECORDED';

UPDATE "Batch"
SET "mode" = 'RECORDED'::"CourseMode"
WHERE "mode" = 'HYBRID';

UPDATE "Course" AS c
SET "mode" = COALESCE(
  (
    SELECT ARRAY_AGG(
      CASE
        WHEN value::text = 'HYBRID' THEN 'RECORDED'::"CourseMode"
        ELSE value
      END
    )
    FROM unnest(c."mode") AS value
  ),
  ARRAY[]::"CourseMode"[]
)
WHERE 'HYBRID' = ANY(c."mode");

-- CourseQualification enum + column
CREATE TYPE "CourseQualification" AS ENUM (
  'B_COM',
  'M_COM',
  'BBA',
  'MBA',
  'BCA',
  'MCA',
  'CA',
  'CA_FOUNDATION',
  'CMA',
  'CS',
  'ACCA'
);

ALTER TABLE "Course"
ADD COLUMN "minimumQualifications" "CourseQualification"[] NOT NULL DEFAULT ARRAY[]::"CourseQualification"[];
