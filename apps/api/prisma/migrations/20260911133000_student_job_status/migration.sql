-- Separate job-applicant marker from Student.status.
-- Safe for databases that still contain StudentStatus = 'JOB_APPLIED'.

DO $$ BEGIN
  CREATE TYPE "StudentJobStatus" AS ENUM ('JOB_APPLIED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Student"
ADD COLUMN IF NOT EXISTS "jobStatus" "StudentJobStatus";

-- Move legacy job-applicant marker off Student.status before enum cleanup.
UPDATE "Student"
SET "jobStatus" = 'JOB_APPLIED'::"StudentJobStatus"
WHERE "status"::text = 'JOB_APPLIED'
  AND "jobStatus" IS NULL;

UPDATE "Student"
SET "status" = 'LEAD'::"StudentStatus"
WHERE "status"::text = 'JOB_APPLIED';

-- Remove JOB_APPLIED from StudentStatus when present.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    WHERE t.typname = 'StudentStatus'
      AND e.enumlabel = 'JOB_APPLIED'
  ) THEN
    CREATE TYPE "StudentStatus_new" AS ENUM (
      'LEAD',
      'ENQUIRED',
      'ADMITTED',
      'COMPLETED',
      'DROPPED',
      'PLACED'
    );

    ALTER TABLE "Student"
      ALTER COLUMN "status" DROP DEFAULT;

    ALTER TABLE "Student"
      ALTER COLUMN "status" TYPE "StudentStatus_new"
      USING ("status"::text::"StudentStatus_new");

    ALTER TABLE "Student"
      ALTER COLUMN "status" SET DEFAULT 'LEAD';

    DROP TYPE "StudentStatus";
    ALTER TYPE "StudentStatus_new" RENAME TO "StudentStatus";
  END IF;
END $$;
