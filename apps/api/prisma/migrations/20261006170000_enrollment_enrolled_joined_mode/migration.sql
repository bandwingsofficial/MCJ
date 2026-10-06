-- Step 1: Add new enum labels (must commit before use in follow-up migration).

ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'ENROLLED';
ALTER TYPE "EnrollmentStatus" ADD VALUE IF NOT EXISTS 'JOINED';
ALTER TYPE "StudentStatus" ADD VALUE IF NOT EXISTS 'ENROLLED';
ALTER TYPE "StudentStatus" ADD VALUE IF NOT EXISTS 'JOINED';
ALTER TYPE "EnrollmentMode" ADD VALUE IF NOT EXISTS 'SELF_PACED_RECORDED';
