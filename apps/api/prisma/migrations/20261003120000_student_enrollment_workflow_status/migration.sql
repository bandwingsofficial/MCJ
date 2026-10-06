-- Map legacy student ENQUIRED to LEAD before removing enum value (safe if ENQUIRED already removed).

UPDATE "Student"
SET "status" = 'LEAD'::"StudentStatus"
WHERE "status"::text = 'ENQUIRED';

ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'LEAD';
ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'PLACED';

UPDATE "Enrollment"
SET "status" = 'LEAD'::"EnrollmentStatus"
WHERE "status"::text IN ('PENDING', 'PENDING_APPROVAL');

UPDATE "Enrollment"
SET "status" = 'ADMITTED'::"EnrollmentStatus"
WHERE "status"::text = 'ACTIVE';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'StudentStatus' AND e.enumlabel = 'ENQUIRED'
  ) THEN
    ALTER TYPE "StudentStatus" RENAME TO "StudentStatus_old";

    CREATE TYPE "StudentStatus" AS ENUM (
      'LEAD',
      'ADVANCED',
      'ADMITTED',
      'COMPLETED',
      'DROPPED',
      'PLACED'
    );

    ALTER TABLE "Student"
      ALTER COLUMN "status" TYPE "StudentStatus"
      USING ("status"::text::"StudentStatus");

    DROP TYPE "StudentStatus_old";
  END IF;
END $$;
