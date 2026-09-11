-- Backfill HYBRID -> RECORDED after CourseMode.RECORDED is committed.

UPDATE "Batch"
SET "mode" = 'RECORDED'::"CourseMode"
WHERE "mode"::text = 'HYBRID';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'Course'
      AND column_name = 'mode'
  ) THEN
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
  END IF;
END $$;
