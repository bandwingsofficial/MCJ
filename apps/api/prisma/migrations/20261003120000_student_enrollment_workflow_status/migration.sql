-- Map legacy student ENQUIRED to LEAD before removing enum value.
UPDATE "Student"
SET "status" = 'LEAD'::"StudentStatus"
WHERE "status" = 'ENQUIRED';

ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'LEAD';
ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'PLACED';

-- Align legacy enrollments to workflow display statuses where applicable.
UPDATE "Enrollment"
SET "status" = 'LEAD'::"EnrollmentStatus"
WHERE "status" IN ('PENDING'::"EnrollmentStatus", 'PENDING_APPROVAL'::"EnrollmentStatus");

UPDATE "Enrollment"
SET "status" = 'ADMITTED'::"EnrollmentStatus"
WHERE "status" = 'ACTIVE'::"EnrollmentStatus";

-- Remove ENQUIRED from StudentStatus (PostgreSQL: rename + recreate pattern).
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
