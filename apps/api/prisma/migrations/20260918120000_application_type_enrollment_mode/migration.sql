-- Application Type (where the student/application originated)
-- Enrollment Mode (how the student takes the course)
-- These are intentionally separate from EnrollmentSource and CourseMode.

CREATE TYPE "ApplicationType" AS ENUM ('OFFLINE', 'ONLINE');

CREATE TYPE "EnrollmentMode" AS ENUM ('OFFLINE', 'ONLINE', 'SELF_PACED');

-- Student.applicationType defaults to OFFLINE for admin-created / existing rows.
ALTER TABLE "Student"
  ADD COLUMN IF NOT EXISTS "applicationType" "ApplicationType" NOT NULL DEFAULT 'OFFLINE';

-- Enrollment.applicationType + mode
ALTER TABLE "Enrollment"
  ADD COLUMN IF NOT EXISTS "applicationType" "ApplicationType" NOT NULL DEFAULT 'OFFLINE';

ALTER TABLE "Enrollment"
  ADD COLUMN IF NOT EXISTS "mode" "EnrollmentMode" NOT NULL DEFAULT 'OFFLINE';

-- Backfill enrollment mode from batch timing (preferred) or batch CourseMode.
-- CourseMode.RECORDED maps to EnrollmentMode.SELF_PACED.
UPDATE "Enrollment" e
SET "mode" = sub.mapped_mode
FROM (
  SELECT
    e2."id" AS enrollment_id,
    CASE
      WHEN bt."mode"::text = 'RECORDED' THEN 'SELF_PACED'::"EnrollmentMode"
      WHEN bt."mode"::text = 'ONLINE' THEN 'ONLINE'::"EnrollmentMode"
      WHEN bt."mode"::text = 'OFFLINE' THEN 'OFFLINE'::"EnrollmentMode"
      WHEN b."mode"::text = 'RECORDED' THEN 'SELF_PACED'::"EnrollmentMode"
      WHEN b."mode"::text = 'ONLINE' THEN 'ONLINE'::"EnrollmentMode"
      ELSE 'OFFLINE'::"EnrollmentMode"
    END AS mapped_mode
  FROM "Enrollment" e2
  INNER JOIN "Batch" b ON b."id" = e2."batchId"
  LEFT JOIN "BatchTiming" bt ON bt."id" = e2."batchTimingId"
) AS sub
WHERE e."id" = sub.enrollment_id;

-- Allow multiple current enrollments per student (different batches/courses).
-- Keep one-current-per-student-batch uniqueness.
DROP INDEX IF EXISTS "Enrollment_one_current_per_student";

CREATE INDEX IF NOT EXISTS "Enrollment_applicationType_idx" ON "Enrollment"("applicationType");
CREATE INDEX IF NOT EXISTS "Enrollment_mode_idx" ON "Enrollment"("mode");
CREATE INDEX IF NOT EXISTS "Student_applicationType_idx" ON "Student"("applicationType");
