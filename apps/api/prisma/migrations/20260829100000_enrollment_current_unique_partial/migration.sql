-- Allow historical enrollments (CANCELLED / COMPLETED / DROPPED / REJECTED /
-- soft-deleted) for the same student+batch while still preventing two CURRENT
-- enrollments for the same student in the same batch.
--
-- Also re-assert the global one-current-enrollment-per-student index when data
-- is clean.

-- 1) Replace full unique (studentId, batchId) with a partial unique for
--    current statuses only.
DROP INDEX IF EXISTS "Enrollment_studentId_batchId_key";

CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_one_current_per_student_batch"
  ON "Enrollment" ("studentId", "batchId")
  WHERE "isDeleted" = false
    AND "status" IN ('PENDING', 'PENDING_APPROVAL', 'ADMITTED', 'ACTIVE');

-- 2) Global one-current enrollment per student (skip if duplicates remain).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM "Enrollment"
    WHERE "isDeleted" = false
      AND "status"::text IN ('PENDING', 'PENDING_APPROVAL', 'ADMITTED', 'ACTIVE')
    GROUP BY "studentId"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'Skipped Enrollment_one_current_per_student because duplicate current enrollments exist';
    RETURN;
  END IF;

  CREATE UNIQUE INDEX IF NOT EXISTS "Enrollment_one_current_per_student"
    ON "Enrollment" ("studentId")
    WHERE "isDeleted" = false
      AND "status" IN ('PENDING', 'PENDING_APPROVAL', 'ADMITTED', 'ACTIVE');
END $$;
