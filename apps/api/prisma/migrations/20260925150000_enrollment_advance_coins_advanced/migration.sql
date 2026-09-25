-- ADVANCED lifecycle + enrollment coin discount fields

ALTER TYPE "StudentStatus" ADD VALUE IF NOT EXISTS 'ADVANCED';

ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'ADVANCED';

ALTER TABLE "Enrollment"
  ADD COLUMN IF NOT EXISTS "coinDiscountAmount" DECIMAL(12, 2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "redeemedCoins" INTEGER NOT NULL DEFAULT 0;

-- Include ADVANCED in partial unique indexes for current enrollments
DROP INDEX IF EXISTS "Enrollment_one_current_per_student_batch";
DROP INDEX IF EXISTS "Enrollment_one_current_per_student";

CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_one_current_per_student_batch"
  ON "Enrollment" ("studentId", "batchId")
  WHERE "isDeleted" = false
    AND "status" IN (
      'PENDING',
      'PENDING_APPROVAL',
      'ADVANCED',
      'ADMITTED',
      'ACTIVE'
    );

CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_one_current_per_student"
  ON "Enrollment" ("studentId")
  WHERE "isDeleted" = false
    AND "status" IN (
      'PENDING',
      'PENDING_APPROVAL',
      'ADVANCED',
      'ADMITTED',
      'ACTIVE'
    );
