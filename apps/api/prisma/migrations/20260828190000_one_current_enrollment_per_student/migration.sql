-- One current (non-deleted PENDING / PENDING_APPROVAL / ADMITTED / ACTIVE)
-- enrollment per student. Historical rows remain for reporting.
--
-- If duplicate current enrollments already exist, the unique index is skipped
-- so this migration can apply. Application-level validation still rejects new
-- duplicates. After duplicates are resolved, re-run the CREATE UNIQUE INDEX
-- statement below (or a follow-up migration).

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
