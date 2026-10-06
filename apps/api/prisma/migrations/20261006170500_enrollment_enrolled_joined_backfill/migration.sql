-- Step 2: Backfill row values (new enum labels committed in step 1).

UPDATE "Enrollment"
SET status = 'ENROLLED'::"EnrollmentStatus"
WHERE status::text = 'ADVANCED';

UPDATE "Enrollment"
SET status = 'JOINED'::"EnrollmentStatus"
WHERE status::text = 'ADMITTED';

UPDATE "Student"
SET status = 'ENROLLED'::"StudentStatus"
WHERE status::text = 'ADVANCED';

UPDATE "Student"
SET status = 'JOINED'::"StudentStatus"
WHERE status::text = 'ADMITTED';

UPDATE "Enrollment"
SET mode = 'SELF_PACED_RECORDED'::"EnrollmentMode"
WHERE mode::text = 'SELF_PACED';
