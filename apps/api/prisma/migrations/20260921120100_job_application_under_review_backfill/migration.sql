-- Backfill pending applications and set new default (separate txn after enum commit).

UPDATE "JobApplication"
SET status = 'UNDER_REVIEW'
WHERE status = 'APPLIED';

ALTER TABLE "JobApplication"
ALTER COLUMN status SET DEFAULT 'UNDER_REVIEW';
