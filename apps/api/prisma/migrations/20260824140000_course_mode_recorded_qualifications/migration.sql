-- Course mode + qualifications (enum-safe, idempotent)
-- NOTE: PostgreSQL cannot use a newly added enum value in the same
-- transaction. Data backfill for HYBRID -> RECORDED lives in the next
-- migration: 20260824140001_course_mode_hybrid_backfill.

ALTER TYPE "CourseMode" ADD VALUE IF NOT EXISTS 'RECORDED';

DO $$ BEGIN
  CREATE TYPE "CourseQualification" AS ENUM (
    'B_COM',
    'M_COM',
    'BBA',
    'MBA',
    'BCA',
    'MCA',
    'CA',
    'CA_FOUNDATION',
    'CMA',
    'CS',
    'ACCA'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE "Course"
ADD COLUMN IF NOT EXISTS "minimumQualifications" "CourseQualification"[] NOT NULL DEFAULT ARRAY[]::"CourseQualification"[];
