-- Student lifecycle: DROPPED → CANCELLED (no Dropped in admin lifecycle).

ALTER TYPE "StudentStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';

UPDATE "Student"
SET status = 'CANCELLED'
WHERE status = 'DROPPED';
