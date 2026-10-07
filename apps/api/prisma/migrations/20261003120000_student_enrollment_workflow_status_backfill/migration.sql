-- Uses EnrollmentStatus LEAD only after 20261003120000_student_enrollment_workflow_status committed it.

UPDATE "Enrollment"
SET "status" = 'LEAD'::"EnrollmentStatus"
WHERE "status"::text IN ('PENDING', 'PENDING_APPROVAL');
