-- Backfill missing batchTimingId for the known PUBLIC online enrollment
-- that selected Morning Batch (OFFLINE, 07:00–09:00) during Customer-Web checkout.
-- Only update rows that still have NULL timing and match that unique timing.

UPDATE "Enrollment" e
SET
  "batchTimingId" = bt.id,
  "mode" = CASE
    WHEN bt.mode = 'RECORDED' THEN 'SELF_PACED'::"EnrollmentMode"
    WHEN bt.mode = 'ONLINE' THEN 'ONLINE'::"EnrollmentMode"
    ELSE 'OFFLINE'::"EnrollmentMode"
  END,
  "joiningDate" = COALESCE(e."joiningDate", bt."startDate"),
  "expectedCompletionDate" = COALESCE(e."expectedCompletionDate", bt."endDate")
FROM "BatchTiming" bt
WHERE e."batchTimingId" IS NULL
  AND e."source" = 'PUBLIC'
  AND e."isDeleted" = false
  AND e."batchId" = bt."batchId"
  AND bt."isDeleted" = false
  AND bt.name = 'Morning Batch'
  AND bt.mode = 'OFFLINE'
  AND bt."startTime" = '07:00'
  AND bt."endTime" = '09:00'
  AND e.mode = 'OFFLINE'
  AND (
    SELECT COUNT(*)::int
    FROM "BatchTiming" candidate
    WHERE candidate."batchId" = e."batchId"
      AND candidate."isDeleted" = false
      AND candidate.name = 'Morning Batch'
      AND candidate.mode = 'OFFLINE'
      AND candidate."startTime" = '07:00'
      AND candidate."endTime" = '09:00'
  ) = 1;

-- Keep timing seat counters accurate for any repaired admitted rows.
UPDATE "BatchTiming" bt
SET "enrolledCount" = (
  SELECT COUNT(*)::int
  FROM "Enrollment" e
  WHERE e."batchTimingId" = bt.id
    AND e."isDeleted" = false
    AND e.status IN ('ADMITTED', 'ACTIVE')
)
WHERE bt.id IN (
  SELECT DISTINCT e."batchTimingId"
  FROM "Enrollment" e
  WHERE e."source" = 'PUBLIC'
    AND e."batchTimingId" IS NOT NULL
    AND e."isDeleted" = false
);
