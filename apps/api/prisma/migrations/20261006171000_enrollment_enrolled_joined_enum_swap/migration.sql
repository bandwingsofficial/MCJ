-- Step 3: Remove legacy enum labels and refresh partial unique indexes.

DROP INDEX IF EXISTS "Enrollment_one_current_per_student_batch";
DROP INDEX IF EXISTS "Enrollment_one_current_per_student";

ALTER TYPE "EnrollmentStatus" RENAME TO "EnrollmentStatus_old";

CREATE TYPE "EnrollmentStatus" AS ENUM (
  'PENDING',
  'PENDING_APPROVAL',
  'LEAD',
  'ENROLLED',
  'JOINED',
  'ACTIVE',
  'COMPLETED',
  'DROPPED',
  'PLACED',
  'CANCELLED',
  'REJECTED'
);

ALTER TABLE "Enrollment"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "EnrollmentStatus"
    USING ("status"::text::"EnrollmentStatus"),
  ALTER COLUMN "status" SET DEFAULT 'PENDING'::"EnrollmentStatus";

DROP TYPE "EnrollmentStatus_old";

ALTER TYPE "StudentStatus" RENAME TO "StudentStatus_old";

CREATE TYPE "StudentStatus" AS ENUM (
  'LEAD',
  'ENROLLED',
  'JOINED',
  'COMPLETED',
  'CANCELLED',
  'DROPPED',
  'PLACED'
);

ALTER TABLE "Student"
  ALTER COLUMN "status" DROP DEFAULT,
  ALTER COLUMN "status" TYPE "StudentStatus"
    USING ("status"::text::"StudentStatus"),
  ALTER COLUMN "status" SET DEFAULT 'LEAD'::"StudentStatus";

DROP TYPE "StudentStatus_old";

ALTER TYPE "EnrollmentMode" RENAME TO "EnrollmentMode_old";

CREATE TYPE "EnrollmentMode" AS ENUM ('OFFLINE', 'ONLINE', 'SELF_PACED_RECORDED');

ALTER TABLE "Enrollment"
  ALTER COLUMN "mode" DROP DEFAULT,
  ALTER COLUMN "mode" TYPE "EnrollmentMode"
    USING ("mode"::text::"EnrollmentMode"),
  ALTER COLUMN "mode" SET DEFAULT 'OFFLINE'::"EnrollmentMode";

DROP TYPE "EnrollmentMode_old";

CREATE UNIQUE INDEX "Enrollment_one_current_per_student_batch"
  ON "Enrollment" ("studentId", "batchId")
  WHERE "isDeleted" = false
    AND "status" IN (
      'PENDING',
      'PENDING_APPROVAL',
      'ENROLLED',
      'JOINED',
      'ACTIVE'
    );

CREATE UNIQUE INDEX "Enrollment_one_current_per_student"
  ON "Enrollment" ("studentId")
  WHERE "isDeleted" = false
    AND "status" IN (
      'PENDING',
      'PENDING_APPROVAL',
      'ENROLLED',
      'JOINED',
      'ACTIVE'
    );
