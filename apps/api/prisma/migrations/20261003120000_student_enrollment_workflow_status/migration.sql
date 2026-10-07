-- Map legacy student ENQUIRED to LEAD before removing enum value (safe if ENQUIRED already removed).

UPDATE "Student"
SET "status" = 'LEAD'::"StudentStatus"
WHERE "status"::text = 'ENQUIRED';

ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'LEAD';
ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'PLACED';

UPDATE "Enrollment"
SET "status" = 'ADMITTED'::"EnrollmentStatus"
WHERE "status"::text = 'ACTIVE';

DO $$
DECLARE
  label_list text;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'StudentStatus' AND e.enumlabel = 'ENQUIRED'
  ) THEN
    SELECT string_agg(quote_literal(e.enumlabel), ', ' ORDER BY e.enumsortorder)
      INTO label_list
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'StudentStatus'
      AND e.enumlabel <> 'ENQUIRED';

    ALTER TABLE "Student" ALTER COLUMN "status" DROP DEFAULT;
    ALTER TYPE "StudentStatus" RENAME TO "StudentStatus_old";
    EXECUTE 'CREATE TYPE "StudentStatus" AS ENUM (' || label_list || ')';

    ALTER TABLE "Student"
      ALTER COLUMN "status" TYPE "StudentStatus"
      USING (
        CASE "status"::text
          WHEN 'ENQUIRED' THEN 'LEAD'
          ELSE "status"::text
        END::"StudentStatus"
      );

    ALTER TABLE "Student"
      ALTER COLUMN "status" SET DEFAULT 'LEAD'::"StudentStatus";

    DROP TYPE "StudentStatus_old";
  END IF;
END $$;
