-- Backfill Customer-Web (PUBLIC) enrollments that incorrectly received OFFLINE
-- from the database default before applicationType was set explicitly.
-- Only touch PUBLIC source rows — never guess Admin OFFLINE records.

UPDATE "Enrollment"
SET "applicationType" = 'ONLINE'
WHERE "source" = 'PUBLIC'
  AND "applicationType" = 'OFFLINE'
  AND "isDeleted" = false;

-- Paid or complimentary public enrollments still stuck in pending approval
-- must become ADMITTED (no manual approval after verified payment / free enroll).
UPDATE "Enrollment"
SET
  "status" = 'ADMITTED',
  "isActive" = true,
  "admissionDate" = COALESCE("admissionDate", NOW())
WHERE "source" = 'PUBLIC'
  AND "isDeleted" = false
  AND "status" IN ('PENDING', 'PENDING_APPROVAL')
  AND (
    "paymentStatus" = 'PAID'
    OR "finalAmount" <= 0
  );

-- Sync linked Student records for admitted PUBLIC enrollments.
UPDATE "Student" s
SET
  "applicationType" = 'ONLINE',
  "status" = CASE
    WHEN s."status" IN ('LEAD', 'ENQUIRED') THEN 'ADMITTED'::"StudentStatus"
    ELSE s."status"
  END
FROM "Enrollment" e
WHERE e."studentId" = s."id"
  AND e."source" = 'PUBLIC'
  AND e."status" IN ('ADMITTED', 'ACTIVE')
  AND e."isDeleted" = false
  AND s."isDeleted" = false;
